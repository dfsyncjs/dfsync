import type { ClientConfig, RetryConfig } from '../types/config';
import type { RequestConfig } from '../types/request';

const DEFAULT_TIMEOUT = 5000;

const DEFAULT_RETRY: Required<RetryConfig> = {
  attempts: 0,
  backoff: 'exponential',
  baseDelayMs: 300,
  retryOn: ['network-error', '5xx'],
  retryMethods: ['GET', 'PUT', 'DELETE'],
};

export type ResolvedRuntimeConfig = {
  fetchImpl: typeof globalThis.fetch;
  timeout: number;
  retry: Required<RetryConfig>;
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
