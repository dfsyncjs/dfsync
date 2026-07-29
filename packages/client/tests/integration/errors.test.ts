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

  it('attaches request context metadata to thrown HttpError', async () => {
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

    await expect(client.get('/users/999', { requestId: 'req_abc' })).rejects.toMatchObject({
      requestId: 'req_abc',
      attempt: 0,
    });

    try {
      await client.get('/users/999', { requestId: 'req_abc' });
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError);
      expect((error as HttpError).durationMs).toBeTypeOf('number');
      // Response details remain available on HttpError.
      expect((error as HttpError).status).toBe(404);
    }
  });

  it('reports the final attempt number on the thrown error after retries', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => {
      throw new TypeError('fetch failed');
    });

    const client = createClient({
      baseUrl: 'https://api.test.com',
      fetch: fetchMock,
      retry: {
        attempts: 2,
        baseDelayMs: 0,
        retryOn: ['network-error'],
        retryMethods: ['GET'],
      },
    });

    try {
      await client.get('/users/1', { requestId: 'req_retry' });
      expect.unreachable('expected NetworkError to be thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(NetworkError);
      expect((error as NetworkError).requestId).toBe('req_retry');
      expect((error as NetworkError).attempt).toBe(2);
    }
  });
});
