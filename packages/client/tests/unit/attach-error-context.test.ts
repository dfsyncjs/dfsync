import { describe, expect, it } from 'vitest';

import { attachErrorContext } from '../../src/core/attach-error-context';
import { DfsyncError } from '../../src/errors/base-error';
import { NetworkError } from '../../src/errors/network-error';
import type { ExecutionContext } from '../../src/core/execution-context';

function createExecutionContextMock(overrides: Partial<ExecutionContext> = {}): ExecutionContext {
  return {
    request: {
      method: 'GET',
      path: '/users',
    },
    url: new URL('https://api.example.com/users'),
    headers: {},
    attempt: 2,
    maxAttempts: 3,
    requestId: 'req_123',
    startedAt: 1700000000000,
    endedAt: 1700000000150,
    durationMs: 150,
    ...overrides,
  };
}

describe('attachErrorContext', () => {
  it('attaches requestId, attempt, and durationMs to DfsyncError instances', () => {
    const error = new NetworkError('Network request failed');
    const execution = createExecutionContextMock();

    attachErrorContext(error, execution);

    expect(error.requestId).toBe('req_123');
    expect(error.attempt).toBe(2);
    expect(error.durationMs).toBe(150);
  });

  it('leaves durationMs undefined when execution has not finalized', () => {
    const error = new DfsyncError('boom', 'TEST_ERROR');
    const execution: ExecutionContext = {
      request: { method: 'GET', path: '/users' },
      url: new URL('https://api.example.com/users'),
      headers: {},
      attempt: 2,
      maxAttempts: 3,
      requestId: 'req_123',
      startedAt: 1700000000000,
    };

    attachErrorContext(error, execution);

    expect(error.requestId).toBe('req_123');
    expect(error.attempt).toBe(2);
    expect(error.durationMs).toBeUndefined();
  });

  it('does not modify non-DfsyncError errors', () => {
    const error = new Error('plain');
    const execution = createExecutionContextMock();

    attachErrorContext(error, execution);

    expect(error).not.toHaveProperty('requestId');
    expect(error).not.toHaveProperty('attempt');
    expect(error).not.toHaveProperty('durationMs');
  });
});
