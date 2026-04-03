import { HttpError } from '../errors/http-error';
import type { RetryBackoff } from '../types/config';
import { getRetryDelay } from './get-retry-delay';
import { parseRetryAfter } from './parse-retry-after';

export type RetryDelaySource = 'backoff' | 'retry-after';

type GetRetryDelayFromErrorParams = {
  error: Error;
  attempt: number;
  backoff: RetryBackoff;
  baseDelayMs: number;
};

type RetryDelayResult = {
  delayMs: number;
  source: RetryDelaySource;
};

export function getRetryDelayFromError({
  error,
  attempt,
  backoff,
  baseDelayMs,
}: GetRetryDelayFromErrorParams): RetryDelayResult {
  if (error instanceof HttpError) {
    const retryAfter = error.response.headers.get('retry-after');
    const retryAfterDelayMs = parseRetryAfter(retryAfter);

    if (retryAfterDelayMs !== undefined) {
      return {
        delayMs: retryAfterDelayMs,
        source: 'retry-after',
      };
    }
  }

  return {
    delayMs: getRetryDelay({
      attempt,
      backoff,
      baseDelayMs,
    }),
    source: 'backoff',
  };
}
