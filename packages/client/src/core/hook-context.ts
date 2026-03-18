import type { AfterResponseContext, BeforeRequestContext, ErrorContext } from '../types/hooks';
import type { HeadersMap } from '../types/common';
import type { RequestConfig } from '../types/request';

type HookContextBase = {
  request: RequestConfig;
  url: URL;
  headers: HeadersMap;
};

export function createBeforeRequestContext(base: HookContextBase): BeforeRequestContext {
  return {
    request: base.request,
    url: base.url,
    headers: base.headers,
  };
}

export function createAfterResponseContext<T>(
  base: HookContextBase,
  response: Response,
  data: T,
): AfterResponseContext<T> {
  return {
    request: base.request,
    url: base.url,
    headers: base.headers,
    response,
    data,
  };
}

export function createErrorContext(base: HookContextBase, error: Error): ErrorContext {
  return {
    request: base.request,
    url: base.url,
    headers: base.headers,
    error,
  };
}
