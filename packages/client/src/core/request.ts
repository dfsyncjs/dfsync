import { HttpError } from '../errors/http-error';
import { NetworkError } from '../errors/network-error';
import type { HeadersMap } from '../types/common';
import type { ClientConfig } from '../types/config';
import type { RequestConfig } from '../types/request';
import { applyAuth } from './apply-auth';
import { buildUrl } from './build-url';
import { createExecutionContext } from './execution-context';
import { createRequestController } from './create-request-controller';
import {
  createAfterResponseContext,
  createBeforeRequestContext,
  createErrorContext,
} from './hook-context';
import { getRetryDelay } from './get-retry-delay';
import { normalizeError } from './normalize-error';
import { parseResponse } from './parse-response';
import { resolveRuntimeConfig } from './resolve-runtime-config';
import { runHooks, runHooksSafely } from './run-hooks';
import { shouldRetry } from './should-retry';
import { sleep } from './sleep';

export async function request<T>(
  clientConfig: ClientConfig,
  requestConfig: RequestConfig,
): Promise<T> {
  const { fetchImpl, timeout, retry } = resolveRuntimeConfig(clientConfig, requestConfig);

  const url = new URL(buildUrl(clientConfig.baseUrl, requestConfig.path, requestConfig.query));

  let lastError: Error | undefined;

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
    });

    await applyAuth({
      auth: clientConfig.auth,
      request: execution.request,
      url: execution.url,
      headers: execution.headers,
    });

    await runHooks(clientConfig.hooks?.beforeRequest, createBeforeRequestContext(execution));

    let body: BodyInit | undefined;

    if (execution.request.body !== undefined) {
      if (typeof execution.request.body === 'string') {
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
      data = await parseResponse(response);

      if (!response.ok) {
        throw new HttpError(response, data);
      }
    } catch (rawError) {
      const error = normalizeError(rawError, timeout);
      lastError = error;

      const canRetry = shouldRetry({
        attempt: execution.attempt,
        method: execution.request.method,
        retry,
        error,
      });

      if (!canRetry) {
        await runHooksSafely(clientConfig.hooks?.onError, createErrorContext(execution, error));

        throw error;
      }

      const delay = getRetryDelay({
        attempt: execution.attempt + 1,
        backoff: retry.backoff,
        baseDelayMs: retry.baseDelayMs,
      });

      await sleep(delay);
      continue;
    } finally {
      requestController.cleanup();
    }

    await runHooks(
      clientConfig.hooks?.afterResponse,
      createAfterResponseContext(execution, response, data),
    );

    return data as T;
  }

  throw lastError ?? new NetworkError('Network request failed');
}
