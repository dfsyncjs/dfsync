import type { HeadersMap } from '../types/common';
import type { RequestConfig } from '../types/request';

export type ExecutionContext = {
  request: RequestConfig;
  url: URL;
  headers: HeadersMap;
  attempt: number;

  // future lifecycle fields
  requestId: string;
  startedAt: number;
};

type CreateExecutionContextParams = {
  request: RequestConfig;
  url: URL;
  headers: HeadersMap;
  attempt: number;
};

function generateRequestId(): string {
  return Math.random().toString(36).slice(2);
}

export function createExecutionContext(params: CreateExecutionContextParams): ExecutionContext {
  return {
    request: params.request,
    url: params.url,
    headers: params.headers,
    attempt: params.attempt,

    requestId: params.request.requestId ?? generateRequestId(),
    startedAt: Date.now(),
  };
}
