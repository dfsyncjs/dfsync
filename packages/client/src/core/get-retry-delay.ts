import type { RetryBackoff } from '../types/config';

type GetRetryDelayParams = {
  attempt: number;
  backoff: RetryBackoff;
  baseDelayMs: number;
  jitter?: boolean | undefined;
};

export function getRetryDelay({
  attempt,
  backoff,
  baseDelayMs,
  jitter = false,
}: GetRetryDelayParams): number {
  const baseDelay = backoff === 'fixed' ? baseDelayMs : baseDelayMs * 2 ** (attempt - 1);

  if (jitter) {
    // Full jitter: uniformly pick a delay in [0, baseDelay] to spread retries.
    return Math.random() * baseDelay;
  }

  return baseDelay;
}
