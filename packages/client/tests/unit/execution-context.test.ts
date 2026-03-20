import { describe, expect, it, vi } from 'vitest';

import { createExecutionContext } from '../../src/core/execution-context';
import type { HeadersMap } from '../../src/types/common';
import type { RequestConfig } from '../../src/types/request';

describe('createExecutionContext', () => {
  it('uses request.requestId when provided', () => {
    const execution = createExecutionContext({
      request: {
        method: 'GET',
        path: '/users',
        requestId: 'req_custom_123',
      },
      url: new URL('https://api.example.com/users'),
      headers: {},
      attempt: 0,
    });

    expect(execution.requestId).toBe('req_custom_123');
  });

  it('generates requestId when request.requestId is not provided', () => {
    const execution = createExecutionContext({
      request: {
        method: 'GET',
        path: '/users',
      },
      url: new URL('https://api.example.com/users'),
      headers: {},
      attempt: 0,
    });

    expect(typeof execution.requestId).toBe('string');
    expect(execution.requestId.length).toBeGreaterThan(0);
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
    });

    expect(execution.attempt).toBe(2);
    expect(execution.request.method).toBe('GET');
    expect(execution.request.path).toBe('/users');
    expect(execution.url.toString()).toBe('https://api.example.com/users');
    expect(execution.headers).toBe(headers);

    expect(execution.requestId).toEqual(expect.any(String));
    expect(execution.requestId.length).toBeGreaterThan(0);

    expect(execution.startedAt).toBe(1234567890);

    dateNowSpy.mockRestore();
  });
});
