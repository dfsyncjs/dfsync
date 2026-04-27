import { describe, expect, it } from 'vitest';

import { applyRequestMetadata } from '../../src/core/apply-request-metadata';
import type { ExecutionContext } from '../../src/core/execution-context';
import type { RequestConfig } from '../../src/types/request';

function createExecutionContext(overrides?: Partial<ExecutionContext>): ExecutionContext {
  const request: RequestConfig = {
    method: 'GET',
    path: '/users',
  };

  return {
    request,
    url: new URL('https://api.example.com/users'),
    headers: {
      accept: 'application/json',
    },
    attempt: 0,
    maxAttempts: 1,
    requestId: 'req-123',
    startedAt: 1234567890,
    ...overrides,
  };
}

describe('applyRequestMetadata', () => {
  it('adds x-request-id header when it is missing', () => {
    const execution = createExecutionContext();

    applyRequestMetadata(execution);

    expect(execution.headers['x-request-id']).toBe('req-123');
  });

  it('does not overwrite an existing x-request-id header', () => {
    const execution = createExecutionContext({
      headers: {
        accept: 'application/json',
        'x-request-id': 'existing-request-id',
      },
    });

    applyRequestMetadata(execution);

    expect(execution.headers['x-request-id']).toBe('existing-request-id');
  });

  it('adds idempotency-key header when idempotencyKey is provided', () => {
    const execution = createExecutionContext({
      request: {
        method: 'POST',
        path: '/payments',
        idempotencyKey: 'idem-123',
      },
    });

    applyRequestMetadata(execution);

    expect(execution.headers['idempotency-key']).toBe('idem-123');
  });

  it('does not overwrite an existing idempotency-key header', () => {
    const execution = createExecutionContext({
      request: {
        method: 'POST',
        path: '/payments',
        idempotencyKey: 'idem-from-option',
      },
      headers: {
        accept: 'application/json',
        'idempotency-key': 'idem-from-header',
      },
    });

    applyRequestMetadata(execution);

    expect(execution.headers['idempotency-key']).toBe('idem-from-header');
  });

  it('does not add idempotency-key header when idempotencyKey is not provided', () => {
    const execution = createExecutionContext();

    applyRequestMetadata(execution);

    expect(execution.headers).not.toHaveProperty('idempotency-key');
  });
});
