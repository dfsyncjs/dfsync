import type { HeadersMap } from './common';
import type { RequestConfig } from './request';
import type { RetryCondition } from './config';

type LifecycleContextBase = {
  request: RequestConfig;
  url: URL;
  headers: HeadersMap;
  attempt: number;
  maxAttempts: number;
  requestId: string;
  startedAt: number;
  endedAt?: number;
  durationMs?: number;
  signal?: AbortSignal | undefined;
};

export type BeforeRequestContext = LifecycleContextBase;

export type AfterResponseContext<T = unknown> = LifecycleContextBase & {
  response: Response;
  data: T;
};

export type ErrorContext = LifecycleContextBase & {
  error: Error;
};

export type RetrySource = 'backoff' | 'retry-after';

export type RetryContext = LifecycleContextBase & {
  error: Error;
  retryDelayMs: number;
  retryReason: RetryCondition;
  retrySource: RetrySource;
};

export type HookBeforeRequest = (ctx: BeforeRequestContext) => void | Promise<void>;
export type HookAfterResponse<T = unknown> = (ctx: AfterResponseContext<T>) => void | Promise<void>;
export type HookOnError = (ctx: ErrorContext) => void | Promise<void>;
export type HookOnRetry = (ctx: RetryContext) => void | Promise<void>;

export type HooksConfig = {
  beforeRequest?: HookBeforeRequest | HookBeforeRequest[];
  afterResponse?: HookAfterResponse | HookAfterResponse[];
  onError?: HookOnError | HookOnError[];
  onRetry?: HookOnRetry | HookOnRetry[];
};
