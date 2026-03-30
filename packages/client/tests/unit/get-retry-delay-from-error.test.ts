import { afterEach, describe, expect, it, vi } from 'vitest';

import { HttpError } from '../../src/errors/http-error';
import { NetworkError } from '../../src/errors/network-error';
import { getRetryDelayFromError } from '../../src/core/get-retry-delay-from-error';

describe('getRetryDelayFromError', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses Retry-After header when present and valid', () => {
    const response = new Response('Too Many Requests', {
      status: 429,
      headers: {
        'retry-after': '5',
      },
    });

    const error = new HttpError(response);

    const result = getRetryDelayFromError({
      error,
      attempt: 1,
      backoff: 'fixed',
      baseDelayMs: 200,
    });

    expect(result).toEqual({
      delayMs: 5_000,
      source: 'retry-after',
    });
  });

  it('falls back to backoff when Retry-After header is invalid', () => {
    const response = new Response('Too Many Requests', {
      status: 429,
      headers: {
        'retry-after': 'invalid-value',
      },
    });

    const error = new HttpError(response);

    const result = getRetryDelayFromError({
      error,
      attempt: 2,
      backoff: 'fixed',
      baseDelayMs: 300,
    });

    expect(result).toEqual({
      delayMs: 300,
      source: 'backoff',
    });
  });

  it('falls back to backoff when Retry-After header is missing', () => {
    const response = new Response('Service Unavailable', {
      status: 503,
    });

    const error = new HttpError(response);

    const result = getRetryDelayFromError({
      error,
      attempt: 3,
      backoff: 'exponential',
      baseDelayMs: 100,
    });

    expect(result).toEqual({
      delayMs: 400,
      source: 'backoff',
    });
  });

  it('uses backoff for non-HttpError errors', () => {
    const error = new NetworkError('Network request failed');

    const result = getRetryDelayFromError({
      error,
      attempt: 2,
      backoff: 'exponential',
      baseDelayMs: 250,
    });

    expect(result).toEqual({
      delayMs: 500,
      source: 'backoff',
    });
  });

  it('uses Retry-After HTTP-date when present and valid', () => {
    vi.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-03-30T10:00:00.000Z'));

    const response = new Response('Too Many Requests', {
      status: 429,
      headers: {
        'retry-after': 'Mon, 30 Mar 2026 10:00:05 GMT',
      },
    });

    const error = new HttpError(response);

    const result = getRetryDelayFromError({
      error,
      attempt: 1,
      backoff: 'fixed',
      baseDelayMs: 200,
    });

    expect(result).toEqual({
      delayMs: 5_000,
      source: 'retry-after',
    });
  });
});
