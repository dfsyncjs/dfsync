import { describe, expect, it, vi } from 'vitest';
import { createClient } from '../../src/core/create-client';
import { getFirstMockCall } from '../testUtils';

describe('request auth', () => {
  it('adds bearer token header', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      auth: {
        type: 'bearer',
        token: 'secret-token',
      },
    });

    await client.get('/users');

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const firstCall = getFirstMockCall(fetchMock);
    const [, init] = firstCall!;
    expect((init?.headers as Record<string, string>).authorization).toBe('Bearer secret-token');
  });

  it('supports async bearer token resolver', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      auth: {
        type: 'bearer',
        token: async () => 'async-token',
      },
    });

    await client.get('/users');

    const firstCall = getFirstMockCall(fetchMock);
    const [, init] = firstCall!;
    expect((init?.headers as Record<string, string>).authorization).toBe('Bearer async-token');
  });

  it('adds api key to header', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      auth: {
        type: 'apiKey',
        value: 'api-key-123',
      },
    });

    await client.get('/users');

    const firstCall = getFirstMockCall(fetchMock);
    const [, init] = firstCall!;
    expect((init?.headers as Record<string, string>)['x-api-key']).toBe('api-key-123');
  });

  it('adds api key to query string', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      auth: {
        type: 'apiKey',
        value: 'query-key',
        in: 'query',
        name: 'api_key',
      },
    });

    await client.get('/users', {
      query: {
        page: 1,
      },
    });

    const firstCall = getFirstMockCall(fetchMock);
    const [url] = firstCall!;
    expect(url).toBe('https://api.example.com/users?page=1&api_key=query-key');
  });

  it('supports custom auth', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      auth: {
        type: 'custom',
        apply: ({ headers }) => {
          headers['x-service-token'] = 'custom-secret';
        },
      },
    });

    await client.get('/users');

    const firstCall = getFirstMockCall(fetchMock);
    const [, init] = firstCall!;
    expect((init?.headers as Record<string, string>)['x-service-token']).toBe('custom-secret');
  });

  it('runs auth before beforeRequest hook', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const seenHeaders: Record<string, string>[] = [];

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      auth: {
        type: 'bearer',
        token: 'secret-token',
      },
      hooks: {
        beforeRequest: ({ headers }) => {
          seenHeaders.push({ ...headers });
        },
      },
    });

    await client.get('/users');

    expect(seenHeaders[0]).toBeDefined();
    expect(seenHeaders[0]!.authorization).toBe('Bearer secret-token');
  });
});
