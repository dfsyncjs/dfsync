import { afterEach, describe, expect, it, vi } from 'vitest';

import { parseRetryAfter } from '../../src/core/parse-retry-after';

describe('parseRetryAfter', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns undefined for null', () => {
    expect(parseRetryAfter(null)).toBeUndefined();
  });

  it('returns undefined for undefined', () => {
    expect(parseRetryAfter(undefined)).toBeUndefined();
  });

  it('returns undefined for an empty string', () => {
    expect(parseRetryAfter('')).toBeUndefined();
    expect(parseRetryAfter('   ')).toBeUndefined();
  });

  it('parses seconds value to milliseconds', () => {
    expect(parseRetryAfter('120')).toBe(120_000);
  });

  it('returns undefined for invalid numeric format', () => {
    expect(parseRetryAfter('1.5')).toBeUndefined();
    expect(parseRetryAfter('+5')).toBeUndefined();
    expect(parseRetryAfter('1e3')).toBeUndefined();
  });

  it('returns undefined for an invalid date value', () => {
    expect(parseRetryAfter('not-a-date')).toBeUndefined();
  });

  it('parses a future HTTP-date to milliseconds', () => {
    vi.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-03-30T10:00:00.000Z'));

    const result = parseRetryAfter('Mon, 30 Mar 2026 10:00:05 GMT');

    expect(result).toBe(5_000);
  });

  it('returns 0 for a past HTTP-date', () => {
    vi.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-03-30T10:00:00.000Z'));

    const result = parseRetryAfter('Mon, 30 Mar 2026 09:59:55 GMT');

    expect(result).toBe(0);
  });
});
