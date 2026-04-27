import { HttpError } from '../errors/http-error';
import { NetworkError } from '../errors/network-error';
import type { RetryConfig } from '../types/config';
import type { RequestMethod } from '../types/request';

type NormalizedRetryConfig = Required<RetryConfig>;

type ShouldRetryParams = {
  attempt: number;
  method: RequestMethod;
  retry: NormalizedRetryConfig;
  error: unknown;
};

export function shouldRetry({ attempt, method, retry, error }: ShouldRetryParams): boolean {
  if (attempt >= retry.attempts) {
    return false;
  }

  if (!retry.retryMethods.includes(method)) {
    return false;
  }

  if (error instanceof NetworkError) {
    return retry.retryOn.includes('network-error');
  }

  if (error instanceof HttpError) {
    if (error.status === 429) {
      return retry.retryOn.includes('429');
    }

    if (error.status >= 500) {
      return retry.retryOn.includes('5xx');
    }

    return false;
  }

  // Non-transient errors (e.g. validation failures) are not retried.
  return false;
}
