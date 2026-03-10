import { describe, expect, it, vi } from 'vitest';
import { createClient } from '../../src/core/create-client';
import { getFirstMockCall } from '../testUtils';

describe('client.put', () => {
  it('serializes json body and uses PUT method', async () => {
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

    const result = await client.put('/users/1', { name: 'Updated Tom' });

    expect(result).toEqual({ ok: true });

    const [url, init] = getFirstMockCall(fetchMock);

    expect(url).toBe('https://api.test.com/users/1');
    expect(init?.method).toBe('PUT');

    const headers = init?.headers as Record<string, string>;
    expect(headers.accept).toBe('application/json');
    expect(headers['content-type']).toBe('application/json');

    expect(init?.body).toBe(JSON.stringify({ name: 'Updated Tom' }));
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

    await client.put(
      '/users/1',
      { name: 'Tom' },
      {
        headers: {
          'content-type': 'application/merge-patch+json',
        },
      },
    );

    const [, init] = getFirstMockCall(fetchMock);

    const headers = init?.headers as Record<string, string>;
    expect(headers['content-type']).toBe('application/merge-patch+json');
    expect(init?.body).toBe(JSON.stringify({ name: 'Tom' }));
  });
});
