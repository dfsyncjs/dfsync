import { HttpError } from '../errors/http-error';
import { NetworkError } from '../errors/network-error';
import type { RetryCondition } from '../types/config';

export function getRetryReason(error: Error): RetryCondition | undefined {
  if (error instanceof NetworkError) {
    return 'network-error';
  }

  if (error instanceof HttpError) {
    const status = error.status;

    if (status === 429) {
      return '429';
    }

    if (status >= 500) {
      return '5xx';
    }
  }

  return undefined;
}
