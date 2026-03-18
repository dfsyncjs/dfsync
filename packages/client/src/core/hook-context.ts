import type { AfterResponseContext, BeforeRequestContext, ErrorContext } from '../types/hooks';
import type { ExecutionContext } from './execution-context';

export function createBeforeRequestContext(execution: ExecutionContext): BeforeRequestContext {
  return {
    request: execution.request,
    url: execution.url,
    headers: execution.headers,
  };
}

export function createAfterResponseContext<T>(
  execution: ExecutionContext,
  response: Response,
  data: T,
): AfterResponseContext<T> {
  return {
    request: execution.request,
    url: execution.url,
    headers: execution.headers,
    response,
    data,
  };
}

export function createErrorContext(execution: ExecutionContext, error: Error): ErrorContext {
  return {
    request: execution.request,
    url: execution.url,
    headers: execution.headers,
    error,
  };
}
