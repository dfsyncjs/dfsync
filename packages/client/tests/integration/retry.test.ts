import { describe, expect, it, vi } from 'vitest';
import { createClient } from '../../src/core/create-client';
import { HttpError } from '../../src/errors/http-error';
import { NetworkError } from '../../src/errors/network-error';
import { RequestAbortedError } from '../../src/errors/request-aborted-error';

describe('client retry', () => {
  it('retries on 503 and succeeds on the next attempt', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Service Unavailable' }), {
          status: 503,
          statusText: 'Service Unavailable',
          headers: {
            'content-type': 'application/json',
          },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: {
            'content-type': 'application/json',
          },
        }),
      );

    const client = createClient({
      baseUrl: 'https://api.test.com',
      fetch: fetchMock,
      retry: {
        attempts: 1,
      },
    });

    const result = await client.get<{ ok: boolean }>('/users');

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('retries on network error and succeeds on the next attempt', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new Error('socket hang up'))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: {
            'content-type': 'application/json',
          },
        }),
      );

    const client = createClient({
      baseUrl: 'https://api.test.com',
      fetch: fetchMock,
      retry: {
        attempts: 1,
      },
    });

    const result = await client.get<{ ok: boolean }>('/users');

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not retry on 400 responses', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ message: 'Bad Request' }), {
        status: 400,
        statusText: 'Bad Request',
        headers: {
          'content-type': 'application/json',
        },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.test.com',
      fetch: fetchMock,
      retry: {
        attempts: 2,
      },
    });

    await expect(client.get('/users')).rejects.toBeInstanceOf(HttpError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not retry POST by default', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockRejectedValue(new Error('socket hang up'));

    const client = createClient({
      baseUrl: 'https://api.test.com',
      fetch: fetchMock,
      retry: {
        attempts: 2,
      },
    });

    await expect(client.post('/users', { name: 'John' })).rejects.toBeInstanceOf(NetworkError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('retries POST when explicitly allowed', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new Error('socket hang up'))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: {
            'content-type': 'application/json',
          },
        }),
      );

    const client = createClient({
      baseUrl: 'https://api.test.com',
      fetch: fetchMock,
      retry: {
        attempts: 1,
        retryMethods: ['GET', 'PUT', 'DELETE', 'POST'],
      },
    });

    const result = await client.post<{ ok: boolean }>('/users', {
      name: 'John',
    });

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('request retry config overrides client retry config', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => {
      return new Response(JSON.stringify({ message: 'Service Unavailable' }), {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'content-type': 'application/json',
        },
      });
    });

    const client = createClient({
      baseUrl: 'https://api.test.com',
      fetch: fetchMock,
      retry: {
        attempts: 0,
      },
    });

    await expect(
      client.get('/users', {
        retry: {
          attempts: 1,
        },
      }),
    ).rejects.toBeInstanceOf(HttpError);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('calls onError only once after final retry failure', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockRejectedValue(new Error('socket hang up'));

    const onError = vi.fn();

    const client = createClient({
      baseUrl: 'https://api.test.com',
      fetch: fetchMock,
      retry: {
        attempts: 2,
      },
      hooks: {
        onError,
      },
    });

    await expect(client.get('/users')).rejects.toBeInstanceOf(NetworkError);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('calls beforeRequest on every retry attempt', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Service Unavailable' }), {
          status: 503,
          statusText: 'Service Unavailable',
          headers: {
            'content-type': 'application/json',
          },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: {
            'content-type': 'application/json',
          },
        }),
      );

    const beforeRequest = vi.fn();

    const client = createClient({
      baseUrl: 'https://api.test.com',
      fetch: fetchMock,
      retry: {
        attempts: 1,
      },
      hooks: {
        beforeRequest,
      },
    });

    await client.get('/users');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(beforeRequest).toHaveBeenCalledTimes(2);
  });

  it('does not retry externally aborted requests', async () => {
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      return new Promise<Response>((_resolve, reject) => {
        const rejectWithAbortError = () => {
          const abortError = new Error('The operation was aborted');
          abortError.name = 'AbortError';
          reject(abortError);
        };

        if (init?.signal?.aborted) {
          rejectWithAbortError();
          return;
        }

        init?.signal?.addEventListener('abort', rejectWithAbortError, {
          once: true,
        });
      });
    });

    const client = createClient({
      baseUrl: 'https://api.test.com',
      fetch: fetchMock,
      retry: { attempts: 2 },
    });

    const controller = new AbortController();

    const promise = client.get('/users', {
      signal: controller.signal,
    });

    controller.abort();

    await expect(promise).rejects.toBeInstanceOf(RequestAbortedError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
