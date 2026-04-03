import { describe, expect, it } from 'vitest';

import { HttpError } from '../../src/errors/http-error';
import { NetworkError } from '../../src/errors/network-error';
import { getRetryReason } from '../../src/core/get-retry-reason';

describe('getRetryReason', () => {
  it('returns network-error for NetworkError', () => {
    const error = new NetworkError('Network request failed');

    expect(getRetryReason(error)).toBe('network-error');
  });

  it('returns 429 for HttpError with status 429', () => {
    const response = new Response('Too Many Requests', { status: 429 });
    const error = new HttpError(response);

    expect(getRetryReason(error)).toBe('429');
  });

  it('returns 5xx for HttpError with 5xx status', () => {
    const response = new Response('Service Unavailable', { status: 503 });
    const error = new HttpError(response);

    expect(getRetryReason(error)).toBe('5xx');
  });

  it('returns undefined for non-retryable errors', () => {
    const error = new Error('Unknown failure');

    expect(getRetryReason(error)).toBeUndefined();
  });
});
