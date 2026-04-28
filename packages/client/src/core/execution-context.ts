import type { HeadersMap } from '../types/common';
import type { ResponseValidationResult } from '../types/hooks';
import type { RequestConfig } from '../types/request';

export type ExecutionContext = {
  request: RequestConfig;
  url: URL;
  headers: HeadersMap;
  attempt: number;
  maxAttempts: number;
  requestId: string;
  startedAt: number;
  endedAt?: number;
  durationMs?: number;
  validation?: ResponseValidationResult;
};

type CreateExecutionContextParams = {
  request: RequestConfig;
  url: URL;
  headers: HeadersMap;
  attempt: number;
  maxAttempts: number;
  requestId: string;
};

export function createExecutionContext(params: CreateExecutionContextParams): ExecutionContext {
  return {
    request: params.request,
    url: params.url,
    headers: params.headers,
    attempt: params.attempt,
    maxAttempts: params.maxAttempts,
    requestId: params.requestId,
    startedAt: Date.now(),
  };
}
