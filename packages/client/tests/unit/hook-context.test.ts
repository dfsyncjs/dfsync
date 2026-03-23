import { describe, expect, it } from 'vitest';

import {
  createAfterResponseContext,
  createBeforeRequestContext,
  createErrorContext,
} from '../../src/core/hook-context';
import type { ExecutionContext } from '../../src/core/execution-context';

describe('hook-context', () => {
  function createExecutionContextMock(): ExecutionContext {
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
      requestId: 'req_123',
      startedAt: 1700000000000,
    };
  }

  it('creates beforeRequest context with lifecycle fields', () => {
    const execution = createExecutionContextMock();

    const ctx = createBeforeRequestContext(execution);

    expect(ctx.request).toBe(execution.request);
    expect(ctx.url).toBe(execution.url);
    expect(ctx.headers).toBe(execution.headers);
    expect(ctx.attempt).toBe(1);
    expect(ctx.requestId).toBe('req_123');
    expect(ctx.startedAt).toBe(1700000000000);
    expect(ctx.signal).toBe(execution.request.signal);
  });

  it('creates afterResponse context with lifecycle fields', () => {
    const execution = createExecutionContextMock();
    const response = new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });

    const ctx = createAfterResponseContext(execution, response, { ok: true });

    expect(ctx.response).toBe(response);
    expect(ctx.data).toEqual({ ok: true });
    expect(ctx.attempt).toBe(1);
    expect(ctx.requestId).toBe('req_123');
    expect(ctx.startedAt).toBe(1700000000000);
    expect(ctx.signal).toBe(execution.request.signal);
  });

  it('creates error context with lifecycle fields', () => {
    const execution = createExecutionContextMock();
    const error = new Error('boom');

    const ctx = createErrorContext(execution, error);

    expect(ctx.error).toBe(error);
    expect(ctx.attempt).toBe(1);
    expect(ctx.requestId).toBe('req_123');
    expect(ctx.startedAt).toBe(1700000000000);
    expect(ctx.signal).toBe(execution.request.signal);
  });
});
