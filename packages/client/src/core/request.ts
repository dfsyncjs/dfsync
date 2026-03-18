import { HttpError } from '../errors/http-error';
import { NetworkError } from '../errors/network-error';
import type { HeadersMap } from '../types/common';
import type { ClientConfig, RetryConfig } from '../types/config';
import type { RequestConfig } from '../types/request';
import { applyAuth } from './apply-auth';
import { buildUrl } from './build-url';
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

    await applyAuth({
      auth: clientConfig.auth,
      request: requestConfig,
      url,
      headers,
    });

    await runHooks(clientConfig.hooks?.beforeRequest, {
      request: requestConfig,
      url,
      headers,
    });

    let body: BodyInit | undefined;

    if (requestConfig.body !== undefined) {
      if (typeof requestConfig.body === 'string') {
        body = requestConfig.body;
      } else {
        headers['content-type'] = headers['content-type'] ?? 'application/json';
        body = JSON.stringify(requestConfig.body);
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    let response: Response;
    let data: unknown;

    try {
      const init: RequestInit = {
        method: requestConfig.method,
        headers,
        signal: controller.signal,
      };

      if (body !== undefined) {
        init.body = body;
      }

      response = await fetchImpl(url.toString(), init);
      data = await parseResponse(response);

      if (!response.ok) {
        throw new HttpError(response, data);
      }
    } catch (rawError) {
      const error = normalizeError(rawError, timeout);
      lastError = error;

      const canRetry = shouldRetry({
        attempt,
        method: requestConfig.method,
        retry,
        error,
      });

      if (!canRetry) {
        await runHooksSafely(clientConfig.hooks?.onError, {
          request: requestConfig,
          url,
          headers,
          error,
        });

        throw error;
      }

      const delay = getRetryDelay({
        attempt: attempt + 1,
        backoff: retry.backoff,
        baseDelayMs: retry.baseDelayMs,
      });

      await sleep(delay);
      continue;
    } finally {
      clearTimeout(timeoutId);
    }

    await runHooks(clientConfig.hooks?.afterResponse, {
      request: requestConfig,
      url,
      headers,
      response,
      data,
    });

    return data as T;
  }

  throw lastError ?? new NetworkError('Network request failed');
}
