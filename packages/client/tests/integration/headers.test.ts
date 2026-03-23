import { describe, expect, it, vi } from 'vitest';
import { createClient } from '../../src/core/create-client';
import { getFirstFetchInit } from '../testUtils';

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

  it('propagates requestId to x-request-id header', async () => {
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

    await client.get('/users', {
      requestId: 'req_123',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const firstCall = fetchMock.mock.calls[0];
    expect(firstCall).toBeDefined();

    const [, init] = firstCall!;
    const headers = init?.headers as Record<string, string>;

    expect(headers['x-request-id']).toBe('req_123');
  });

  it('prefers explicit x-request-id header over requestId option', async () => {
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

    await client.get('/users', {
      requestId: 'req_from_option',
      headers: {
        'x-request-id': 'req_from_header',
      },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const firstCall = fetchMock.mock.calls[0];
    expect(firstCall).toBeDefined();

    const [, init] = firstCall!;
    const headers = init?.headers as Record<string, string>;

    expect(headers['x-request-id']).toBe('req_from_header');
  });

  it('adds generated x-request-id header when requestId is not provided', async () => {
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

    const init = getFirstFetchInit(fetchMock);
    const headers = init.headers as Record<string, string | undefined>;
    const requestId = headers['x-request-id'];

    expect(requestId).toBeDefined();
    expect(typeof requestId).toBe('string');
    expect(requestId!.length).toBeGreaterThan(0);
  });
});
