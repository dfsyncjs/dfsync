import { describe, expect, it } from 'vitest';

import {
  createAfterResponseContext,
  createBeforeRequestContext,
  createErrorContext,
  createRetryContext,
} from '../../src/core/hook-context';
import type { ExecutionContext } from '../../src/core/execution-context';

describe('hook-context', () => {
  function createExecutionContextMock(overrides: Partial<ExecutionContext> = {}): ExecutionContext {
    const signal = new AbortController().signal;

    return {
      request: {
        method: 'GET',
        path: '/users',
        signal,
      },
      url: new URL('https://api.example.com/users'),
      headers: {
        accept: 'application/json',
        'x-request-id': 'req_123',
      },
      attempt: 1,
      maxAttempts: 3,
      requestId: 'req_123',
      startedAt: 1700000000000,
      ...overrides,
    };
  }

  it('creates beforeRequest context with lifecycle fields', () => {
    const execution = createExecutionContextMock();

    const ctx = createBeforeRequestContext(execution);

    expect(ctx.request).toBe(execution.request);
    expect(ctx.url).toBe(execution.url);
    expect(ctx.headers).toBe(execution.headers);
    expect(ctx.attempt).toBe(1);
    expect(ctx.maxAttempts).toBe(3);
    expect(ctx.requestId).toBe('req_123');
    expect(ctx.startedAt).toBe(1700000000000);
    expect(ctx.endedAt).toBeUndefined();
    expect(ctx.durationMs).toBeUndefined();
    expect(ctx.signal).toBe(execution.request.signal);
  });

  it('creates afterResponse context with lifecycle fields', () => {
    const execution = createExecutionContextMock({
      endedAt: 1700000000123,
      durationMs: 123,
    });
    const response = new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });

    const ctx = createAfterResponseContext(execution, response, { ok: true });

    expect(ctx.response).toBe(response);
    expect(ctx.data).toEqual({ ok: true });
    expect(ctx.attempt).toBe(1);
    expect(ctx.maxAttempts).toBe(3);
    expect(ctx.requestId).toBe('req_123');
    expect(ctx.startedAt).toBe(1700000000000);
    expect(ctx.endedAt).toBe(1700000000123);
    expect(ctx.durationMs).toBe(123);
    expect(ctx.signal).toBe(execution.request.signal);
  });

  it('creates error context with lifecycle fields', () => {
    const execution = createExecutionContextMock({
      endedAt: 1700000000200,
      durationMs: 200,
    });
    const error = new Error('boom');

    const ctx = createErrorContext(execution, error);

    expect(ctx.error).toBe(error);
    expect(ctx.attempt).toBe(1);
    expect(ctx.maxAttempts).toBe(3);
    expect(ctx.requestId).toBe('req_123');
    expect(ctx.startedAt).toBe(1700000000000);
    expect(ctx.endedAt).toBe(1700000000200);
    expect(ctx.durationMs).toBe(200);
    expect(ctx.signal).toBe(execution.request.signal);
  });

  it('creates retry context with retry metadata', () => {
    const execution = createExecutionContextMock({
      endedAt: 1700000000150,
      durationMs: 150,
    });

    const error = new Error('temporary failure');

    const ctx = createRetryContext({
      execution,
      error,
      retryDelayMs: 500,
      retryReason: '5xx',
      retrySource: 'backoff',
    });

    expect(ctx.error).toBe(error);
    expect(ctx.request).toBe(execution.request);
    expect(ctx.url).toBe(execution.url);
    expect(ctx.headers).toBe(execution.headers);
    expect(ctx.attempt).toBe(1);
    expect(ctx.maxAttempts).toBe(3);
    expect(ctx.requestId).toBe('req_123');
    expect(ctx.startedAt).toBe(1700000000000);
    expect(ctx.endedAt).toBe(1700000000150);
    expect(ctx.durationMs).toBe(150);
    expect(ctx.signal).toBe(execution.request.signal);
    expect(ctx.retryDelayMs).toBe(500);
    expect(ctx.retryReason).toBe('5xx');
    expect(ctx.retrySource).toBe('backoff');
  });
});
