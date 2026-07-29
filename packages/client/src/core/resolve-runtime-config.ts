import type { ClientConfig, RetryBackoff, RetryCondition, RetryPredicate } from '../types/config';
import type { RequestConfig, RequestMethod } from '../types/request';

const DEFAULT_TIMEOUT = 5000;

/**
 * Retry config after client/request defaults are applied. `maxElapsedMs` and
 * `shouldRetry` stay optional because they have no meaningful default value.
 */
export type ResolvedRetryConfig = {
  attempts: number;
  backoff: RetryBackoff;
  baseDelayMs: number;
  retryOn: RetryCondition[];
  retryMethods: RequestMethod[];
  jitter: boolean;
  maxElapsedMs?: number;
  shouldRetry?: RetryPredicate;
};

const DEFAULT_RETRY: ResolvedRetryConfig = {
  attempts: 0,
  backoff: 'exponential',
  baseDelayMs: 300,
  retryOn: ['network-error', '5xx'],
  retryMethods: ['GET', 'PUT', 'DELETE'],
  jitter: false,
};

export type ResolvedRuntimeConfig = {
  fetchImpl: typeof globalThis.fetch;
  timeout: number;
  retry: ResolvedRetryConfig;
};

export function resolveRuntimeConfig(
  clientConfig: ClientConfig,
  requestConfig: RequestConfig,
): ResolvedRuntimeConfig {
  const fetchImpl = clientConfig.fetch ?? globalThis.fetch;

  if (!fetchImpl) {
    throw new Error('No fetch implementation available');
  }

  return {
    fetchImpl,
    timeout: requestConfig.timeout ?? clientConfig.timeout ?? DEFAULT_TIMEOUT,
    retry: {
      ...DEFAULT_RETRY,
      ...(clientConfig.retry ?? {}),
      ...(requestConfig.retry ?? {}),
    },
  };
}
