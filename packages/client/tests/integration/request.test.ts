import { describe, expect, it, vi } from 'vitest';

import { createClient } from '../../src/core/create-client';
import { TimeoutError } from '../../src/errors/timeout-error';
import { getFirstMockCall } from '../testUtils';

describe('request', () => {
  it('adds default accept header', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.test.com',
      fetch: fetchMock,
    });

    await client.get('/users');

    const firstCall = getFirstMockCall(fetchMock);
    const [, init] = firstCall;
    const headers = init?.headers as Record<string, string>;

    expect(headers.accept).toBe('application/json');
  });

  it('merges client and request headers with request taking precedence', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.test.com',
      fetch: fetchMock,
      headers: {
        'x-client': '1',
        'x-shared': 'client',
      },
    });

    await client.get('/users', {
      headers: {
        'x-request': '1',
        'x-shared': 'request',
      },
    });

    const firstCall = getFirstMockCall(fetchMock);
    const [, init] = firstCall;
    const headers = init?.headers as Record<string, string>;

    expect(headers['x-client']).toBe('1');
    expect(headers['x-request']).toBe('1');
    expect(headers['x-shared']).toBe('request');
  });

  it('serializes json body and sets content-type by default', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.test.com',
      fetch: fetchMock,
    });

    await client.post('/users', { name: 'Roman' });

    const firstCall = getFirstMockCall(fetchMock);
    const [, init] = firstCall;
    const headers = init?.headers as Record<string, string>;

    expect(headers['content-type']).toBe('application/json');
    expect(init?.body).toBe(JSON.stringify({ name: 'Roman' }));
  });

  it('keeps string body as-is', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.test.com',
      fetch: fetchMock,
    });

    await client.request({
      method: 'POST',
      path: '/raw',
      body: 'plain-text-body',
    });

    const firstCall = getFirstMockCall(fetchMock);
    const [, init] = firstCall;
    expect(init?.body).toBe('plain-text-body');
  });

  it('request timeout overrides client timeout', async () => {
    const fetchMock: typeof fetch = vi.fn((_input, init) => {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          const abortError = new Error('The operation was aborted');
          abortError.name = 'AbortError';
          reject(abortError);
        });
      });
    });

    const client = createClient({
      baseUrl: 'https://api.test.com',
      timeout: 1000,
      fetch: fetchMock,
    });

    await expect(client.get('/slow', { timeout: 10 })).rejects.toBeInstanceOf(TimeoutError);
  });
});
