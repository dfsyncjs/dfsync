import { describe, expect, it, vi } from 'vitest';

import { HttpError } from '../../src/errors/http-error';
import { NetworkError } from '../../src/errors/network-error';
import { TimeoutError } from '../../src/errors/timeout-error';
import { createClient } from '../../src/core/create-client';
import { getFirstMockCall } from '../testUtils';

describe('request hooks', () => {
  it('allows beforeRequest to modify headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      hooks: {
        beforeRequest: ({ headers }) => {
          headers['x-request-id'] = 'req-123';
        },
      },
    });

    await client.get('/users');

    const firstCall = getFirstMockCall(fetchMock);
    const [, init] = firstCall;
    expect((init?.headers as Record<string, string>)['x-request-id']).toBe('req-123');
  });

  it('allows beforeRequest to modify url search params', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      hooks: {
        beforeRequest: ({ url }) => {
          url.searchParams.set('trace', '1');
        },
      },
    });

    await client.get('/users', {
      query: { page: 2 },
    });

    const firstCall = getFirstMockCall(fetchMock);
    const [url] = firstCall;

    expect(url).toBe('https://api.example.com/users?page=2&trace=1');
  });

  it('supports async beforeRequest hooks', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      hooks: {
        beforeRequest: async ({ headers }) => {
          await Promise.resolve();
          headers['x-async'] = 'yes';
        },
      },
    });

    await client.get('/users');

    const firstCall = getFirstMockCall(fetchMock);
    const [, init] = firstCall;
    expect((init?.headers as Record<string, string>)['x-async']).toBe('yes');
  });

  it('runs beforeRequest hooks in order', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const order: string[] = [];

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      hooks: {
        beforeRequest: [
          ({ headers }) => {
            order.push('first');
            headers['x-step-1'] = 'done';
          },
          ({ headers }) => {
            order.push('second');
            headers['x-step-2'] = headers['x-step-1'] + '-next';
          },
        ],
      },
    });

    await client.get('/users');

    expect(order).toEqual(['first', 'second']);

    const firstCall = getFirstMockCall(fetchMock);
    const [, init] = firstCall;
    const headers = init?.headers as Record<string, string>;

    expect(headers['x-step-1']).toBe('done');
    expect(headers['x-step-2']).toBe('done-next');
  });

  it('rethrows beforeRequest error as-is', async () => {
    const fetchMock = vi.fn();

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      hooks: {
        beforeRequest: () => {
          throw new Error('beforeRequest failed');
        },
      },
    });

    await expect(client.get('/users')).rejects.toThrow('beforeRequest failed');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('runs afterResponse hooks in order', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 1 }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const order: string[] = [];

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      hooks: {
        afterResponse: [
          ({ data }) => {
            const typedData = data as { id: number };
            order.push(`first:${typedData.id}`);
          },
          () => {
            order.push('second');
          },
        ],
      },
    });

    await client.get<{ id: number }>('/users/1');

    expect(order).toEqual(['first:1', 'second']);
  });

  it('runs afterResponse on success', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 1 }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const afterResponse = vi.fn();

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      hooks: {
        afterResponse,
      },
    });

    const data = await client.get<{ id: number }>('/users/1');

    expect(data).toEqual({ id: 1 });
    expect(afterResponse).toHaveBeenCalledTimes(1);

    const firstAfterResponseCall = afterResponse.mock.calls[0];
    expect(firstAfterResponseCall).toBeDefined();

    expect(firstAfterResponseCall![0].data).toEqual({ id: 1 });
    expect(firstAfterResponseCall![0].response.status).toBe(200);
  });

  it('rethrows afterResponse hook error as-is', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 1 }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      hooks: {
        afterResponse: () => {
          throw new Error('afterResponse failed');
        },
      },
    });

    await expect(client.get('/users/1')).rejects.toThrow('afterResponse failed');
  });

  it('runs onError for http errors', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: 'Bad Request' }), {
        status: 400,
        statusText: 'Bad Request',
        headers: { 'content-type': 'application/json' },
      }),
    );

    const onError = vi.fn();

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      hooks: {
        onError,
      },
    });

    await expect(client.get('/users')).rejects.toBeInstanceOf(HttpError);

    expect(onError).toHaveBeenCalledTimes(1);

    const firstOnErrorCall = onError.mock.calls[0];
    expect(firstOnErrorCall).toBeDefined();

    expect(firstOnErrorCall![0].error).toBeInstanceOf(HttpError);
  });

  it('runs onError for network errors', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('socket hang up'));
    const onError = vi.fn();

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      hooks: {
        onError,
      },
    });

    await expect(client.get('/users')).rejects.toBeInstanceOf(NetworkError);

    expect(onError).toHaveBeenCalledTimes(1);

    const firstOnErrorCall = onError.mock.calls[0];
    expect(firstOnErrorCall).toBeDefined();

    expect(firstOnErrorCall![0].error).toBeInstanceOf(NetworkError);
  });

  it('does not replace original error when onError hook fails', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('socket hang up'));

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      hooks: {
        onError: () => {
          throw new Error('hook failed');
        },
      },
    });

    await expect(client.get('/users')).rejects.toBeInstanceOf(NetworkError);
  });

  it('runs onError for timeout errors', async () => {
    const fetchMock = vi.fn((_input, init) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          const abortError = new Error('The operation was aborted');
          abortError.name = 'AbortError';
          reject(abortError);
        });
      });
    }) as typeof fetch;

    const onError = vi.fn();

    const client = createClient({
      baseUrl: 'https://api.example.com',
      timeout: 10,
      fetch: fetchMock,
      hooks: {
        onError,
      },
    });

    await expect(client.get('/slow')).rejects.toBeInstanceOf(TimeoutError);

    expect(onError).toHaveBeenCalledTimes(1);
    const firstCall = onError.mock.calls[0];
    expect(firstCall).toBeDefined();
    expect(firstCall![0].error).toBeInstanceOf(TimeoutError);
  });
});
