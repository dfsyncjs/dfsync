import type { RetryBackoff } from '../types/config';

type GetRetryDelayParams = {
  attempt: number;
  backoff: RetryBackoff;
  baseDelayMs: number;
};

export function getRetryDelay({ attempt, backoff, baseDelayMs }: GetRetryDelayParams): number {
  if (backoff === 'fixed') {
    return baseDelayMs;
  }

  return baseDelayMs * 2 ** (attempt - 1);
}
