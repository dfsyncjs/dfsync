import type { HeadersMap } from './common';
import type { RequestConfig } from './request';

type LifecycleContextBase = {
  request: RequestConfig;
  url: URL;
  headers: HeadersMap;
  attempt: number;
  requestId: string;
  startedAt: number;
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

export type HookBeforeRequest = (ctx: BeforeRequestContext) => void | Promise<void>;

export type HookAfterResponse<T = unknown> = (ctx: AfterResponseContext<T>) => void | Promise<void>;

export type HookOnError = (ctx: ErrorContext) => void | Promise<void>;

export type HooksConfig = {
  beforeRequest?: HookBeforeRequest | HookBeforeRequest[];
  afterResponse?: HookAfterResponse | HookAfterResponse[];
  onError?: HookOnError | HookOnError[];
};
