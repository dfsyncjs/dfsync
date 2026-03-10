import { HttpError } from '../errors/http-error';
import { NetworkError } from '../errors/network-error';
import { TimeoutError } from '../errors/timeout-error';
import type { HeadersMap } from '../types/common';
import type { ClientConfig } from '../types/config';
import type { RequestConfig } from '../types/request';
import { applyAuth } from './apply-auth';
import { buildUrl } from './build-url';
import { parseResponse } from './parse-response';
import { runHooks, runHooksSafely } from './run-hooks';

const DEFAULT_TIMEOUT = 5000;

function normalizeError(error: unknown, timeout: number): Error {
  if (error instanceof HttpError) {
    return error;
  }

  if (error instanceof Error && error.name === 'AbortError') {
    return new TimeoutError(timeout, error);
  }

  return new NetworkError('Network request failed', error);
}

export async function request<T>(
  clientConfig: ClientConfig,
  requestConfig: RequestConfig,
): Promise<T> {
  const fetchImpl = clientConfig.fetch ?? globalThis.fetch;

  if (!fetchImpl) {
    throw new Error('No fetch implementation available');
  }

  const url = new URL(buildUrl(clientConfig.baseUrl, requestConfig.path, requestConfig.query));

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

  const timeout = requestConfig.timeout ?? clientConfig.timeout ?? DEFAULT_TIMEOUT;
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

    await runHooksSafely(clientConfig.hooks?.onError, {
      request: requestConfig,
      url,
      headers,
      error,
    });

    throw error;
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
