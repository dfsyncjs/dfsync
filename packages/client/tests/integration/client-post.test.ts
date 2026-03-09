import { describe, expect, it, vi } from 'vitest';
import { createClient } from '../../src/core/create-client';

describe('client.post', () => {
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

    const result = await client.post('/users', { name: 'Tom' });

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const firstCall = fetchMock.mock.calls[0];
    expect(firstCall).toBeDefined();

    const [url, init] = firstCall!;
    expect(url).toBe('https://api.test.com/users');
    expect(init?.method).toBe('POST');

    const headers = init?.headers as Record<string, string>;
    expect(headers.accept).toBe('application/json');
    expect(headers['content-type']).toBe('application/json');
    expect(init?.body).toBe(JSON.stringify({ name: 'Tom' }));
  });

  it('keeps string body as-is and does not force content-type', async () => {
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

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const firstCall = fetchMock.mock.calls[0];
    expect(firstCall).toBeDefined();

    const [url, init] = firstCall!;
    expect(url).toBe('https://api.test.com/raw');
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe('plain-text-body');

    const headers = init?.headers as Record<string, string>;
    expect(headers.accept).toBe('application/json');
    expect(headers['content-type']).toBeUndefined();
  });

  it('preserves custom content-type for object body', async () => {
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

    await client.post(
      '/users',
      { name: 'Roman' },
      {
        headers: {
          'content-type': 'application/merge-patch+json',
        },
      },
    );

    const firstCall = fetchMock.mock.calls[0];
    expect(firstCall).toBeDefined();

    const [, init] = firstCall!;
    const headers = init?.headers as Record<string, string>;

    expect(headers['content-type']).toBe('application/merge-patch+json');
    expect(init?.body).toBe(JSON.stringify({ name: 'Roman' }));
  });

  it('returns text response for post request when response is not json', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('created', {
        status: 201,
        headers: { 'content-type': 'text/plain' },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.test.com',
      fetch: fetchMock,
    });

    const result = await client.post('/users', { name: 'Roman' });

    expect(result).toBe('created');
  });
});
