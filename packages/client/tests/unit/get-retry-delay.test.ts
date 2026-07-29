import { afterEach, describe, expect, it, vi } from 'vitest';
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

  describe('jitter', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('applies full jitter as a fraction of the computed backoff', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);

      expect(
        getRetryDelay({
          attempt: 2,
          backoff: 'exponential',
          baseDelayMs: 300,
          jitter: true,
        }),
      ).toBe(300); // 0.5 * (300 * 2^1)
    });

    it('keeps jittered delay within [0, computed backoff]', () => {
      const computed = 1200; // attempt 3, base 300, exponential

      for (const random of [0, 0.25, 0.75, 0.999]) {
        vi.spyOn(Math, 'random').mockReturnValue(random);

        const delay = getRetryDelay({
          attempt: 3,
          backoff: 'exponential',
          baseDelayMs: 300,
          jitter: true,
        });

        expect(delay).toBeGreaterThanOrEqual(0);
        expect(delay).toBeLessThanOrEqual(computed);
        vi.restoreAllMocks();
      }
    });

    it('does not apply jitter when disabled', () => {
      const spy = vi.spyOn(Math, 'random');

      expect(
        getRetryDelay({
          attempt: 2,
          backoff: 'exponential',
          baseDelayMs: 300,
          jitter: false,
        }),
      ).toBe(600);

      expect(spy).not.toHaveBeenCalled();
    });
  });
});
