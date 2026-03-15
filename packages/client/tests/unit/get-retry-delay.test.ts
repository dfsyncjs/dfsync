import { describe, expect, it } from 'vitest';
import { getRetryDelay } from '../../src/core/get-retry-delay';

describe('getRetryDelay', () => {
  it('returns fixed delay for fixed backoff', () => {
    expect(
      getRetryDelay({
        attempt: 1,
        backoff: 'fixed',
        baseDelayMs: 300,
      }),
    ).toBe(300);

    expect(
      getRetryDelay({
        attempt: 3,
        backoff: 'fixed',
        baseDelayMs: 300,
      }),
    ).toBe(300);
  });

  it('returns exponential delay for exponential backoff', () => {
    expect(
      getRetryDelay({
        attempt: 1,
        backoff: 'exponential',
        baseDelayMs: 300,
      }),
    ).toBe(300);

    expect(
      getRetryDelay({
        attempt: 2,
        backoff: 'exponential',
        baseDelayMs: 300,
      }),
    ).toBe(600);

    expect(
      getRetryDelay({
        attempt: 3,
        backoff: 'exponential',
        baseDelayMs: 300,
      }),
    ).toBe(1200);
  });
});
