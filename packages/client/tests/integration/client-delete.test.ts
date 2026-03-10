import { describe, expect, it, vi } from 'vitest';
import { createClient } from '../../src/core/create-client';
import { getFirstMockCall } from '../testUtils';

describe('client.delete', () => {
  it('performs DELETE request', async () => {
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

    const result = await client.delete('/users/1');

    expect(result).toEqual({ ok: true });

    const [url, init] = getFirstMockCall(fetchMock);

    expect(url).toBe('https://api.test.com/users/1');
    expect(init?.method).toBe('DELETE');

    const headers = init?.headers as Record<string, string>;
    expect(headers.accept).toBe('application/json');
    expect(init?.body).toBeUndefined();
  });

  it('returns undefined for 204 response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 204,
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.test.com',
      fetch: fetchMock,
    });

    const result = await client.delete('/users/1');

    expect(result).toBeUndefined();

    const [url, init] = getFirstMockCall(fetchMock);

    expect(url).toBe('https://api.test.com/users/1');
    expect(init?.method).toBe('DELETE');
  });
});
