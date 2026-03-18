import type { HeadersMap } from '../types/common';
import type { RequestConfig } from '../types/request';

export type ExecutionContext = {
  request: RequestConfig;
  url: URL;
  headers: HeadersMap;
  attempt: number;
};

type CreateExecutionContextParams = {
  request: RequestConfig;
  url: URL;
  headers: HeadersMap;
  attempt: number;
};

export function createExecutionContext(params: CreateExecutionContextParams): ExecutionContext {
  return {
    request: params.request,
    url: params.url,
    headers: params.headers,
    attempt: params.attempt,
  };
}
