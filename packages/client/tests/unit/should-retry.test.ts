import { describe, expect, it } from 'vitest';
import { HttpError } from '../../src/errors/http-error';
import { NetworkError } from '../../src/errors/network-error';
import { ValidationError } from '../../src/errors/validation-error';
import { RequestAbortedError } from '../../src/errors/request-aborted-error';
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

function createValidationError(): ValidationError {
  const response = new Response(JSON.stringify({ name: 'Roman' }), {
    status: 200,
    statusText: 'OK',
    headers: {
      'content-type': 'application/json',
    },
  });

  return new ValidationError(response, { name: 'Roman' });
}

function createParams(
  overrides: Partial<{
    attempt: number;
    method: RequestMethod;
    retry: Required<RetryConfig>;
    idempotencyKey?: string;
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

  it('retries POST when explicitly allowed and idempotencyKey is provided', () => {
    expect(
      shouldRetry(
        createParams({
          method: 'POST',
          idempotencyKey: 'idem-123',
          retry: {
            ...defaultRetry,
            attempts: 3,
            retryMethods: ['POST'],
            retryOn: ['network-error'],
          },
          error: new NetworkError('Network request failed', new Error('socket hang up')),
        }),
      ),
    ).toBe(true);
  });

  it('does not retry POST without idempotencyKey even when explicitly allowed', () => {
    expect(
      shouldRetry(
        createParams({
          method: 'POST',
          retry: {
            ...defaultRetry,
            attempts: 3,
            retryMethods: ['POST'],
            retryOn: ['network-error'],
          },
          error: new NetworkError('Network request failed', new Error('socket hang up')),
        }),
      ),
    ).toBe(false);
  });

  it('does not retry on externally aborted requests', () => {
    expect(
      shouldRetry(
        createParams({
          error: new RequestAbortedError(),
        }),
      ),
    ).toBe(false);
  });

  it('does not retry validation errors', () => {
    expect(
      shouldRetry(
        createParams({
          error: createValidationError(),
        }),
      ),
    ).toBe(false);
  });

  it('does not retry POST requests without idempotencyKey', () => {
    expect(
      shouldRetry(
        createParams({
          method: 'POST',
          retry: {
            ...defaultRetry,
            attempts: 3,
            retryMethods: ['POST'],
            retryOn: ['5xx'],
          },
          error: createHttpError(500),
        }),
      ),
    ).toBe(false);
  });

  it('retries POST requests with idempotencyKey when method and condition are allowed', () => {
    expect(
      shouldRetry(
        createParams({
          method: 'POST',
          idempotencyKey: 'idem-123',
          retry: {
            ...defaultRetry,
            attempts: 3,
            retryMethods: ['POST'],
            retryOn: ['5xx'],
          },
          error: createHttpError(500),
        }),
      ),
    ).toBe(true);
  });

  it('does not retry PATCH requests without idempotencyKey', () => {
    expect(
      shouldRetry(
        createParams({
          method: 'PATCH',
          retry: {
            ...defaultRetry,
            attempts: 3,
            retryMethods: ['PATCH'],
            retryOn: ['5xx'],
          },
          error: createHttpError(500),
        }),
      ),
    ).toBe(false);
  });

  it('retries PATCH requests with idempotencyKey when method and condition are allowed', () => {
    expect(
      shouldRetry(
        createParams({
          method: 'PATCH',
          idempotencyKey: 'idem-123',
          retry: {
            ...defaultRetry,
            attempts: 3,
            retryMethods: ['PATCH'],
            retryOn: ['5xx'],
          },
          error: createHttpError(500),
        }),
      ),
    ).toBe(true);
  });
});
