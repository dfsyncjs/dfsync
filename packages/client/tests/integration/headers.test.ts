import { describe, expect, it, vi } from 'vitest';
import { createClient } from '../../src/core/create-client';

describe('request headers', () => {
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

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const firstCall = fetchMock.mock.calls[0];
    expect(firstCall).toBeDefined();

    const [, init] = firstCall!;
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

    const firstCall = fetchMock.mock.calls[0];
    expect(firstCall).toBeDefined();

    const [, init] = firstCall!;
    const headers = init?.headers as Record<string, string>;

    expect(headers.accept).toBe('application/json');
    expect(headers['x-client']).toBe('1');
    expect(headers['x-request']).toBe('1');
    expect(headers['x-shared']).toBe('request');
  });

  it('auth overrides existing authorization header', async () => {
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
        authorization: 'Bearer old-token',
      },
      auth: {
        type: 'bearer',
        token: 'new-token',
      },
    });

    await client.get('/users');

    const firstCall = fetchMock.mock.calls[0];
    expect(firstCall).toBeDefined();

    const [, init] = firstCall!;
    const headers = init?.headers as Record<string, string>;

    expect(headers.authorization).toBe('Bearer new-token');
  });

  it('request headers override client headers before auth is applied', async () => {
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
        'x-shared': 'client',
      },
      auth: {
        type: 'apiKey',
        value: 'secret-key',
        name: 'x-api-key',
      },
    });

    await client.get('/users', {
      headers: {
        'x-shared': 'request',
        'x-api-key': 'old-key',
      },
    });

    const firstCall = fetchMock.mock.calls[0];
    expect(firstCall).toBeDefined();

    const [, init] = firstCall!;
    const headers = init?.headers as Record<string, string>;

    expect(headers['x-shared']).toBe('request');
    expect(headers['x-api-key']).toBe('secret-key');
  });
});
