import type { HeadersMap } from './common';
import type { AuthConfig } from './auth';
import type { HooksConfig } from './hooks';
import type { RequestMethod } from './request';

export type ResponseValidator<TData = unknown> = (
  data: TData,
) => boolean | void | Promise<boolean | void>;

export type RetryCondition = 'network-error' | '5xx' | '429';
export type RetryBackoff = 'fixed' | 'exponential';

export type RetryPredicateContext = {
  error: Error;
  attempt: number;
  maxAttempts: number;
  requestId: string;
  method: RequestMethod;
};

/**
 * Additional, user-defined retry gate. It is consulted only after the built-in
 * rules already decided a request is retryable, so it can further restrict
 * retries but can never make non-retryable errors (e.g. validation failures or
 * 4xx responses) retryable.
 */
export type RetryPredicate = (ctx: RetryPredicateContext) => boolean;

export type RetryConfig = {
  attempts?: number;
  backoff?: RetryBackoff;
  baseDelayMs?: number;
  retryOn?: RetryCondition[];
  retryMethods?: RequestMethod[];
  /**
   * Overall retry budget in milliseconds, measured from the first attempt. When
   * the next delay would push the elapsed time past this budget, retrying stops
   * and the last error is thrown instead of waiting.
   */
  maxElapsedMs?: number;
  /** Applies full jitter to backoff delays. Does not affect `Retry-After`. */
  jitter?: boolean;
  shouldRetry?: RetryPredicate;
};

export type ClientConfig = {
  baseUrl: string;
  timeout?: number;
  headers?: HeadersMap;
  auth?: AuthConfig;
  hooks?: HooksConfig;
  retry?: RetryConfig;
  fetch?: typeof globalThis.fetch;
  validateResponse?: ResponseValidator;
};
