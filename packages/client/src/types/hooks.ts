import type { HeadersMap } from "./common";
import type { RequestConfig } from "./request";

export type BeforeRequestContext = {
  request: RequestConfig;
  headers: HeadersMap;
};

export type AfterResponseContext<T = unknown> = {
  request: RequestConfig;
  response: Response;
  data: T;
};

export type ErrorContext = {
  request: RequestConfig;
  error: Error;
  attempt: number;
};

export type HookBeforeRequest = (
  ctx: BeforeRequestContext
) => void | Promise<void>;

export type HookAfterResponse = <T = unknown>(
  ctx: AfterResponseContext<T>
) => void | Promise<void>;

export type HookOnError = (
  ctx: ErrorContext
) => void | Promise<void>;

export type HooksConfig = {
  beforeRequest?: HookBeforeRequest | HookBeforeRequest[];
  afterResponse?: HookAfterResponse | HookAfterResponse[];
  onError?: HookOnError | HookOnError[];
};
