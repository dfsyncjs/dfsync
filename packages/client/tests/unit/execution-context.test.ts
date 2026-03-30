import { describe, expect, it, vi } from 'vitest';

import { createExecutionContext } from '../../src/core/execution-context';
import type { HeadersMap } from '../../src/types/common';
import type { RequestConfig } from '../../src/types/request';

describe('createExecutionContext', () => {
  it('uses provided requestId', () => {
    const execution = createExecutionContext({
      request: {
        method: 'GET',
        path: '/users',
        requestId: 'req_custom_123',
      },
      url: new URL('https://api.example.com/users'),
      headers: {},
      attempt: 0,
      maxAttempts: 3,
      requestId: 'req_custom_123',
    });

    expect(execution.requestId).toBe('req_custom_123');
  });

  it('creates execution context with request lifecycle metadata', () => {
    const request: RequestConfig = {
      method: 'GET',
      path: '/users',
    };

    const url = new URL('https://api.example.com/users');
    const headers: HeadersMap = {
      accept: 'application/json',
    };

    const dateNowSpy = vi.spyOn(Date, 'now').mockReturnValue(1234567890);

    const execution = createExecutionContext({
      request,
      url,
      headers,
      attempt: 2,
      maxAttempts: 3,
      requestId: 'req_custom_123',
    });

    expect(execution.attempt).toBe(2);
    expect(execution.maxAttempts).toBe(3);
    expect(execution.request.method).toBe('GET');
    expect(execution.request.path).toBe('/users');
    expect(execution.url.toString()).toBe('https://api.example.com/users');
    expect(execution.headers).toBe(headers);
    expect(execution.requestId).toBe('req_custom_123');
    expect(execution.startedAt).toBe(1234567890);
    expect(execution.endedAt).toBeUndefined();
    expect(execution.durationMs).toBeUndefined();

    dateNowSpy.mockRestore();
  });

  it('stores request and execution requestId independently', () => {
    const execution = createExecutionContext({
      request: {
        method: 'GET',
        path: '/users',
        requestId: 'req_from_request',
      },
      url: new URL('https://api.example.com/users'),
      headers: {},
      attempt: 0,
      maxAttempts: 1,
      requestId: 'req_from_execution',
    });

    expect(execution.request.requestId).toBe('req_from_request');
    expect(execution.requestId).toBe('req_from_execution');
  });
});
