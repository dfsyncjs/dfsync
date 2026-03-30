import type {
  AfterResponseContext,
  BeforeRequestContext,
  ErrorContext,
  RetryContext,
} from '../types/hooks';
import type { ExecutionContext } from './execution-context';

type LifecycleContextBase = Omit<BeforeRequestContext, 'signal'> & {
  signal?: AbortSignal | undefined;
};

function createLifecycleContextBase(execution: ExecutionContext): LifecycleContextBase {
  return {
    request: execution.request,
    url: execution.url,
    headers: execution.headers,
    attempt: execution.attempt,
    maxAttempts: execution.maxAttempts,
    requestId: execution.requestId,
    startedAt: execution.startedAt,
    ...(execution.endedAt !== undefined ? { endedAt: execution.endedAt } : {}),
    ...(execution.durationMs !== undefined ? { durationMs: execution.durationMs } : {}),
    ...(execution.request.signal !== undefined ? { signal: execution.request.signal } : {}),
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

type CreateRetryContextParams = {
  execution: ExecutionContext;
  error: Error;
  retryDelayMs: number;
  retryReason: RetryContext['retryReason'];
  retrySource: RetryContext['retrySource'];
};

export function createRetryContext({
  execution,
  error,
  retryDelayMs,
  retryReason,
  retrySource,
}: CreateRetryContextParams): RetryContext {
  return {
    ...createLifecycleContextBase(execution),
    error,
    retryDelayMs,
    retryReason,
    retrySource,
  };
}
