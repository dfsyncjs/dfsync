import { describe, expect, it, vi } from 'vitest';

import { createExecutionContext } from '../../src/core/execution-context';
import type { HeadersMap } from '../../src/types/common';
import type { RequestConfig } from '../../src/types/request';

describe('createExecutionContext', () => {
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

    expect(execution.request).toBe(request);
    expect(execution.url).toBe(url);
    expect(execution.headers).toBe(headers);
    expect(execution.attempt).toBe(2);

    expect(execution.requestId).toEqual(expect.any(String));
    expect(execution.requestId.length).toBeGreaterThan(0);

    expect(execution.startedAt).toBe(1234567890);

    dateNowSpy.mockRestore();
  });
});
