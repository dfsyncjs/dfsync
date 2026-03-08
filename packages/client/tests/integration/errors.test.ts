import { describe, expect, it, vi } from 'vitest';
import { createClient } from '../../src/core/create-client';
import { HttpError } from '../../src/errors/http-error';
import { NetworkError } from '../../src/errors/network-error';

describe('client errors', () => {
  it('throws HttpError for non-2xx response', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => {
      return new Response(JSON.stringify({ message: 'Not found' }), {
        status: 404,
        statusText: 'Not Found',
        headers: {
          'content-type': 'application/json',
        },
      });
    });

    const client = createClient({
      baseUrl: 'https://api.test.com',
      fetch: fetchMock,
    });

    await expect(client.get('/users/999')).rejects.toBeInstanceOf(HttpError);
  });

  it('throws NetworkError on fetch failure', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => {
      throw new TypeError('fetch failed');
    });

    const client = createClient({
      baseUrl: 'https://api.test.com',
      fetch: fetchMock,
    });

    await expect(client.get('/users/1')).rejects.toBeInstanceOf(NetworkError);
  });
});
