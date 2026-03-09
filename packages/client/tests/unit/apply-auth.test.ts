import { describe, expect, it, vi } from 'vitest';

import { applyAuth } from '../../src/core/apply-auth';
import type { HeadersMap } from '../../src/types/common';
import type { RequestConfig } from '../../src/types/request';

describe('applyAuth', () => {
  const request: RequestConfig = {
    method: 'GET',
    path: '/users',
  };

  it('does nothing when auth is undefined', async () => {
    const url = new URL('https://api.example.com/users');
    const headers: HeadersMap = {};

    await applyAuth({
      auth: undefined,
      request,
      url,
      headers,
    });

    expect(headers).toEqual({});
    expect(url.toString()).toBe('https://api.example.com/users');
  });

  it('applies bearer auth with default header name', async () => {
    const url = new URL('https://api.example.com/users');
    const headers: HeadersMap = {};

    await applyAuth({
      auth: {
        type: 'bearer',
        token: 'secret-token',
      },
      request,
      url,
      headers,
    });

    expect(headers.authorization).toBe('Bearer secret-token');
  });

  it('applies bearer auth with custom header name', async () => {
    const url = new URL('https://api.example.com/users');
    const headers: HeadersMap = {};

    await applyAuth({
      auth: {
        type: 'bearer',
        token: 'secret-token',
        headerName: 'x-authorization',
      },
      request,
      url,
      headers,
    });

    expect(headers['x-authorization']).toBe('Bearer secret-token');
    expect(headers.authorization).toBeUndefined();
  });

  it('supports async bearer token resolver', async () => {
    const url = new URL('https://api.example.com/users');
    const headers: HeadersMap = {};

    await applyAuth({
      auth: {
        type: 'bearer',
        token: async () => 'async-token',
      },
      request,
      url,
      headers,
    });

    expect(headers.authorization).toBe('Bearer async-token');
  });

  it('applies api key auth in header by default', async () => {
    const url = new URL('https://api.example.com/users');
    const headers: HeadersMap = {};

    await applyAuth({
      auth: {
        type: 'apiKey',
        value: 'api-key-123',
      },
      request,
      url,
      headers,
    });

    expect(headers['x-api-key']).toBe('api-key-123');
  });

  it('applies api key auth in query', async () => {
    const url = new URL('https://api.example.com/users?page=1');
    const headers: HeadersMap = {};

    await applyAuth({
      auth: {
        type: 'apiKey',
        value: 'query-key',
        in: 'query',
        name: 'api_key',
      },
      request,
      url,
      headers,
    });

    expect(url.toString()).toBe('https://api.example.com/users?page=1&api_key=query-key');
    expect(headers['x-api-key']).toBeUndefined();
  });

  it('supports async api key resolver', async () => {
    const url = new URL('https://api.example.com/users');
    const headers: HeadersMap = {};

    await applyAuth({
      auth: {
        type: 'apiKey',
        value: async () => 'async-api-key',
        name: 'x-service-key',
      },
      request,
      url,
      headers,
    });

    expect(headers['x-service-key']).toBe('async-api-key');
  });

  it('calls custom auth and allows modifying headers and url', async () => {
    const url = new URL('https://api.example.com/users');
    const headers: HeadersMap = {};
    const apply = vi.fn(({ headers: currentHeaders, url: currentUrl }) => {
      currentHeaders['x-service-name'] = 'billing-worker';
      currentUrl.searchParams.set('tenant', 'acme');
    });

    await applyAuth({
      auth: {
        type: 'custom',
        apply,
      },
      request,
      url,
      headers,
    });

    expect(apply).toHaveBeenCalledTimes(1);
    expect(headers['x-service-name']).toBe('billing-worker');
    expect(url.toString()).toBe('https://api.example.com/users?tenant=acme');
  });
});
