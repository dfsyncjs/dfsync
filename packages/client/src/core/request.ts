import { DfsyncError } from '../errors/base-error';
import { HttpError } from '../errors/http-error';
import { NetworkError } from '../errors/network-error';
import { ParseError } from '../errors/parse-error';
import { ValidationError } from '../errors/validation-error';
import type { HeadersMap } from '../types/common';
import type { ClientConfig, SerializerContext } from '../types/config';
import type { RequestConfig } from '../types/request';
import { applyAuth } from './apply-auth';
import { buildUrl } from './build-url';
import { applyRequestMetadata } from './apply-request-metadata';
import { attachErrorContext } from './attach-error-context';
import type { ExecutionContext } from './execution-context';
import { createExecutionContext } from './execution-context';
import { createRequestController } from './create-request-controller';
import {
  createAfterResponseContext,
  createBeforeRequestContext,
  createErrorContext,
  createRetryContext,
} from './hook-context';
import { getRetryDelayFromError } from './get-retry-delay-from-error';
import { getRetryReason } from './get-retry-reason';
import { isAbortError } from './is-abort-error';
import { normalizeError } from './normalize-error';
import { parseResponse } from './parse-response';
import { resolveResponseValidator } from './resolve-response-validator';
import { resolveRuntimeConfig } from './resolve-runtime-config';
import { runHooks, runHooksSafely } from './run-hooks';
import { shouldRetry } from './should-retry';
import { sleep } from './sleep';

function finalizeExecution(execution: ExecutionContext): void {
  const endedAt = Date.now();

  execution.endedAt = endedAt;
  execution.durationMs = endedAt - execution.startedAt;
}

async function failWithError(
  clientConfig: ClientConfig,
  execution: ExecutionContext,
  error: Error,
): Promise<never> {
  finalizeExecution(execution);
  attachErrorContext(error, execution);

  await runHooksSafely(clientConfig.hooks?.onError, createErrorContext(execution, error));
  throw error;
}

export async function request<T>(
  clientConfig: ClientConfig,
  requestConfig: RequestConfig,
): Promise<T> {
  const { fetchImpl, timeout, retry } = resolveRuntimeConfig(clientConfig, requestConfig);

  const url = new URL(buildUrl(clientConfig.baseUrl, requestConfig.path, requestConfig.query));

  let lastError: Error | undefined;
  const requestId = requestConfig.requestId ?? Math.random().toString(36).slice(2);
  const overallStartedAt = Date.now();

  for (let attempt = 0; attempt <= retry.attempts; attempt++) {
    const headers: HeadersMap = {
      accept: 'application/json',
      ...(clientConfig.headers ?? {}),
      ...(requestConfig.headers ?? {}),
    };

    const execution = createExecutionContext({
      request: requestConfig,
      url,
      headers,
      attempt,
      maxAttempts: retry.attempts + 1,
      requestId,
    });

    applyRequestMetadata(execution);

    await applyAuth({
      auth: clientConfig.auth,
      request: execution.request,
      url: execution.url,
      headers: execution.headers,
    });

    await runHooks(clientConfig.hooks?.beforeRequest, createBeforeRequestContext(execution));

    const serializerContext: SerializerContext = {
      request: execution.request,
      requestId: execution.requestId,
    };

    let body: BodyInit | undefined;

    if (execution.request.body !== undefined) {
      const serializeBody = execution.request.serializeBody ?? clientConfig.serializeBody;

      if (serializeBody) {
        const serialized = await serializeBody(execution.request.body, serializerContext);
        body = serialized.body;

        if (serialized.contentType) {
          execution.headers['content-type'] =
            execution.headers['content-type'] ?? serialized.contentType;
        }
      } else if (typeof execution.request.body === 'string') {
        body = execution.request.body;
      } else {
        execution.headers['content-type'] = execution.headers['content-type'] ?? 'application/json';
        body = JSON.stringify(execution.request.body);
      }
    }

    const requestController = createRequestController({
      timeout,
      signal: execution.request.signal,
    });

    let response: Response;
    let data: unknown;

    try {
      const init: RequestInit = {
        method: execution.request.method,
        headers: execution.headers,
        signal: requestController.signal,
      };

      if (body !== undefined) {
        init.body = body;
      }

      response = await fetchImpl(execution.url.toString(), init);

      const parse = execution.request.parseResponse ?? clientConfig.parseResponse;

      let parseFailure: { cause: unknown } | undefined;

      try {
        data = parse ? await parse(response, serializerContext) : await parseResponse(response);
      } catch (rawParseError) {
        // Abort errors keep their own classification (timeout vs cancellation), and
        // `DfsyncError` instances are never re-wrapped, so both are rethrown as-is.
        if (rawParseError instanceof DfsyncError || isAbortError(rawParseError)) {
          throw rawParseError;
        }

        parseFailure = { cause: rawParseError };
      }

      // A failed response is classified by its status even when its body could not be
      // parsed, so a parsing failure never masks the HTTP status or its retry behavior.
      if (!response.ok) {
        throw new HttpError(response, data);
      }

      if (parseFailure) {
        throw new ParseError(response, parseFailure.cause);
      }

      // Effective validator: a request-level option beats a client-level one,
      // and within the same level a `responseSchema` adapter beats a
      // `validateResponse` predicate.
      const validator = resolveResponseValidator(clientConfig, execution.request);

      if (validator) {
        let passed: boolean;
        let issues: unknown;

        if ('schema' in validator) {
          const result = await validator.schema(data);
          passed = result.success;
          issues = result.error;
        } else {
          const result = await validator.predicate(data);
          passed = result !== false;
        }

        execution.validation = {
          enabled: true,
          passed,
        };

        if (!passed) {
          throw new ValidationError(response, data, issues);
        }
      }
    } catch (rawError) {
      const error = normalizeError(rawError, timeout, requestController.getAbortReason());
      lastError = error;

      const canRetry = shouldRetry({
        attempt: execution.attempt,
        method: execution.request.method,
        retry,
        idempotencyKey: execution.request.idempotencyKey,
        error,
      });

      if (!canRetry) {
        return failWithError(clientConfig, execution, error);
      }

      const retryReason = getRetryReason(error);

      if (!retryReason) {
        return failWithError(clientConfig, execution, error);
      }

      // Custom retry gate runs only after built-in rules already allow a retry,
      // so it can restrict retries but never widen them.
      if (
        retry.shouldRetry &&
        !retry.shouldRetry({
          error,
          attempt: execution.attempt,
          maxAttempts: execution.maxAttempts,
          requestId: execution.requestId,
          method: execution.request.method,
        })
      ) {
        return failWithError(clientConfig, execution, error);
      }

      const { delayMs, source } = getRetryDelayFromError({
        error,
        attempt: execution.attempt + 1,
        backoff: retry.backoff,
        baseDelayMs: retry.baseDelayMs,
        jitter: retry.jitter,
      });

      // Stop retrying when waiting the next delay would exceed the retry budget.
      if (
        retry.maxElapsedMs !== undefined &&
        Date.now() - overallStartedAt + delayMs > retry.maxElapsedMs
      ) {
        return failWithError(clientConfig, execution, error);
      }

      await runHooksSafely(
        clientConfig.hooks?.onRetry,
        createRetryContext({
          execution,
          error,
          retryDelayMs: delayMs,
          retryReason,
          retrySource: source,
        }),
      );

      await sleep(delayMs);
      continue;
    } finally {
      requestController.cleanup();
    }

    finalizeExecution(execution);

    await runHooks(
      clientConfig.hooks?.afterResponse,
      createAfterResponseContext(execution, response, data),
    );

    return data as T;
  }

  throw lastError ?? new NetworkError('Network request failed');
}
