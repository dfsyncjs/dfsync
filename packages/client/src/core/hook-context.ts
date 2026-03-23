import type { AfterResponseContext, BeforeRequestContext, ErrorContext } from '../types/hooks';
import type { ExecutionContext } from './execution-context';

function createLifecycleContextBase(
  execution: ExecutionContext,
): Omit<BeforeRequestContext, never> {
  return {
    request: execution.request,
    url: execution.url,
    headers: execution.headers,
    attempt: execution.attempt,
    requestId: execution.requestId,
    startedAt: execution.startedAt,
    signal: execution.request.signal,
  };
}

export function createBeforeRequestContext(execution: ExecutionContext): BeforeRequestContext {
  return createLifecycleContextBase(execution);
}

export function createAfterResponseContext<T>(
  execution: ExecutionContext,
  response: Response,
  data: T,
): AfterResponseContext<T> {
  return {
    ...createLifecycleContextBase(execution),
    response,
    data,
  };
}

export function createErrorContext(execution: ExecutionContext, error: Error): ErrorContext {
  return {
    ...createLifecycleContextBase(execution),
    error,
  };
}
