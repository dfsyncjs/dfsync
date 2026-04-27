export { createClient } from './core/create-client';

export { DfsyncError } from './errors/base-error';
export { HttpError } from './errors/http-error';
export { NetworkError } from './errors/network-error';
export { TimeoutError } from './errors/timeout-error';
export { ValidationError } from './errors/validation-error';
export { RequestAbortedError } from './errors/request-aborted-error';

export type { AuthConfig } from './types/auth';
export type { Client } from './types/client';
export type {
  ClientConfig,
  RetryConfig,
  RetryCondition,
  RetryBackoff,
  ResponseValidator,
} from './types/config';
export type {
  AfterResponseContext,
  BeforeRequestContext,
  ErrorContext,
  HooksConfig,
  HookAfterResponse,
  HookBeforeRequest,
  HookOnError,
  HookOnRetry,
  RetryContext,
  RetrySource,
} from './types/hooks';
export type { RequestConfig, RequestMethod, RequestOptions } from './types/request';
