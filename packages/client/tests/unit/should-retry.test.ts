import { describe, expect, it } from 'vitest';
import { HttpError } from '../../src/errors/http-error';
import { NetworkError } from '../../src/errors/network-error';
import { shouldRetry } from '../../src/core/should-retry';
import type { RetryConfig } from '../../src/types/config';
import type { RequestMethod } from '../../src/types/request';

const defaultRetry: Required<RetryConfig> = {
  attempts: 2,
  backoff: 'exponential',
  baseDelayMs: 300,
  retryOn: ['network-error', '5xx'],
  retryMethods: ['GET', 'PUT', 'DELETE'],
};

function createHttpError(status: number, statusText = 'Error'): HttpError {
  const response = new Response(null, {
    status,
    statusText,
  });

  return new HttpError(response);
}

function createParams(
  overrides: Partial<{
    attempt: number;
    method: RequestMethod;
    retry: Required<RetryConfig>;
    error: unknown;
  }> = {},
) {
  return {
    attempt: 0,
    method: 'GET' as RequestMethod,
    retry: defaultRetry,
    error: new NetworkError(),
    ...overrides,
  };
}

describe('shouldRetry', () => {
  it('retries on network errors when enabled', () => {
    expect(
      shouldRetry(
        createParams({
          error: new NetworkError(),
        }),
      ),
    ).toBe(true);
  });

  it('retries on 5xx responses when enabled', () => {
    expect(
      shouldRetry(
        createParams({
          error: createHttpError(503, 'Service Unavailable'),
        }),
      ),
    ).toBe(true);
  });

  it('retries on 429 responses when enabled', () => {
    expect(
      shouldRetry(
        createParams({
          retry: {
            ...defaultRetry,
            retryOn: ['429'],
          },
          error: createHttpError(429, 'Too Many Requests'),
        }),
      ),
    ).toBe(true);
  });

  it('does not retry on 4xx responses', () => {
    expect(
      shouldRetry(
        createParams({
          error: createHttpError(400, 'Bad Request'),
        }),
      ),
    ).toBe(false);
  });

  it('does not retry when attempts are exhausted', () => {
    expect(
      shouldRetry(
        createParams({
          attempt: 2,
          error: new NetworkError(),
        }),
      ),
    ).toBe(false);
  });

  it('does not retry POST by default', () => {
    expect(
      shouldRetry(
        createParams({
          method: 'POST',
          error: new NetworkError(),
        }),
      ),
    ).toBe(false);
  });

  it('retries POST when explicitly allowed', () => {
    expect(
      shouldRetry(
        createParams({
          method: 'POST',
          retry: {
            ...defaultRetry,
            retryMethods: ['GET', 'PUT', 'DELETE', 'POST'],
          },
          error: new NetworkError(),
        }),
      ),
    ).toBe(true);
  });
});
