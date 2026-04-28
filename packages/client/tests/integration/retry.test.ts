import { describe, expect, it, vi } from 'vitest';
import { createClient } from '../../src/core/create-client';
import { HttpError } from '../../src/errors/http-error';
import { NetworkError } from '../../src/errors/network-error';
import { RequestAbortedError } from '../../src/errors/request-aborted-error';
import { getFirstMockCall, getSecondMockCall } from '../testUtils';

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

  it('retries POST when explicitly allowed and idempotencyKey is provided', async () => {
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

    const result = await client.post<{ ok: boolean }>(
      '/users',
      {
        name: 'John',
      },
      { idempotencyKey: 'idem-123' },
    );

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not retry POST requests without idempotencyKey even when POST is allowed', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: 'server error' }), {
        status: 500,
        headers: {
          'content-type': 'application/json',
        },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      retry: {
        attempts: 3,
        retryMethods: ['POST'],
        retryOn: ['5xx'],
        baseDelayMs: 0,
      },
    });

    await expect(client.post('/payments', { amount: 100 })).rejects.toThrow();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('retries POST requests with idempotencyKey when POST is allowed', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'server error' }), {
          status: 500,
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
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      retry: {
        attempts: 2,
        retryMethods: ['POST'],
        retryOn: ['5xx'],
        baseDelayMs: 0,
      },
    });

    await expect(
      client.post('/payments', { amount: 100 }, { idempotencyKey: 'idem-123' }),
    ).resolves.toEqual({ ok: true });

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

  it('calls onRetry with retry metadata before retrying', async () => {
    const onRetry = vi.fn();

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('Service Unavailable', { status: 503 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      retry: {
        attempts: 1,
        retryOn: ['5xx'],
        backoff: 'fixed',
        baseDelayMs: 100,
      },
      hooks: {
        onRetry,
      },
      fetch: fetchMock,
    });

    await expect(client.get('/health')).resolves.toEqual({ ok: true });

    expect(onRetry).toHaveBeenCalledTimes(1);

    const [ctx] = getFirstMockCall(onRetry);

    expect(ctx.attempt).toBe(0);
    expect(ctx.maxAttempts).toBe(2);
    expect(ctx.retryDelayMs).toBe(100);
    expect(ctx.retryReason).toBe('5xx');
    expect(ctx.retrySource).toBe('backoff');
    expect(typeof ctx.requestId).toBe('string');
    expect(typeof ctx.startedAt).toBe('number');
    expect(ctx.error).toBeInstanceOf(Error);
  });

  it('does not call onRetry when retry is not allowed', async () => {
    const onRetry = vi.fn();

    const fetchMock = vi.fn().mockResolvedValue(new Response('Bad Request', { status: 400 }));

    const client = createClient({
      baseUrl: 'https://api.example.com',
      retry: {
        attempts: 2,
        retryOn: ['5xx'],
        backoff: 'fixed',
        baseDelayMs: 100,
      },
      hooks: {
        onRetry,
      },
      fetch: fetchMock,
    });

    await expect(client.get('/health')).rejects.toThrow();

    expect(onRetry).not.toHaveBeenCalled();
  });

  it('uses Retry-After header value instead of backoff delay', async () => {
    const onRetry = vi.fn();

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response('Too Many Requests', {
          status: 429,
          headers: {
            'retry-after': '2',
          },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      retry: {
        attempts: 1,
        retryOn: ['429'],
        backoff: 'fixed',
        baseDelayMs: 100,
      },
      hooks: {
        onRetry,
      },
      fetch: fetchMock,
    });

    await expect(client.get('/health')).resolves.toEqual({ ok: true });

    expect(onRetry).toHaveBeenCalledTimes(1);

    const [ctx] = getFirstMockCall(onRetry);

    expect(ctx.retryDelayMs).toBe(2_000);
    expect(ctx.retryReason).toBe('429');
    expect(ctx.retrySource).toBe('retry-after');
  });

  it('falls back to backoff when Retry-After header is invalid', async () => {
    const onRetry = vi.fn();

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response('Too Many Requests', {
          status: 429,
          headers: {
            'retry-after': 'invalid',
          },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      retry: {
        attempts: 1,
        retryOn: ['429'],
        backoff: 'fixed',
        baseDelayMs: 150,
      },
      hooks: {
        onRetry,
      },
      fetch: fetchMock,
    });

    await expect(client.get('/health')).resolves.toEqual({ ok: true });

    const [ctx] = getFirstMockCall(onRetry);

    expect(ctx.retryDelayMs).toBe(150);
    expect(ctx.retrySource).toBe('backoff');
  });

  it('provides timing metadata to afterResponse hook', async () => {
    const afterResponse = vi.fn();

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      hooks: {
        afterResponse,
      },
      fetch: fetchMock,
    });

    await expect(client.get('/health')).resolves.toEqual({ ok: true });

    expect(afterResponse).toHaveBeenCalledTimes(1);

    const [ctx] = getFirstMockCall(afterResponse);

    expect(typeof ctx.startedAt).toBe('number');
    expect(typeof ctx.endedAt).toBe('number');
    expect(typeof ctx.durationMs).toBe('number');
    expect(ctx.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('provides timing metadata to onError hook on final failure', async () => {
    const onError = vi.fn();

    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('Service Unavailable', { status: 503 }));

    const client = createClient({
      baseUrl: 'https://api.example.com',
      retry: {
        attempts: 0,
        retryOn: ['5xx'],
        backoff: 'fixed',
        baseDelayMs: 100,
      },
      hooks: {
        onError,
      },
      fetch: fetchMock,
    });

    await expect(client.get('/health')).rejects.toThrow();

    expect(onError).toHaveBeenCalledTimes(1);

    const [ctx] = getFirstMockCall(onError);

    expect(typeof ctx.startedAt).toBe('number');
    expect(typeof ctx.endedAt).toBe('number');
    expect(typeof ctx.durationMs).toBe('number');
    expect(ctx.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('calls onRetry for each retry attempt', async () => {
    const onRetry = vi.fn();

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('Service Unavailable', { status: 503 }))
      .mockResolvedValueOnce(new Response('Service Unavailable', { status: 503 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      retry: {
        attempts: 2,
        retryOn: ['5xx'],
        backoff: 'fixed',
        baseDelayMs: 100,
      },
      hooks: {
        onRetry,
      },
    });

    await expect(client.get('/health')).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(onRetry).toHaveBeenCalledTimes(2);

    const [firstCtx] = getFirstMockCall(onRetry);
    const [secondCtx] = getSecondMockCall(onRetry);

    expect(firstCtx.attempt).toBe(0);
    expect(secondCtx.attempt).toBe(1);
    expect(firstCtx.maxAttempts).toBe(3);
    expect(secondCtx.maxAttempts).toBe(3);
  });

  it('keeps the same requestId across retries', async () => {
    const onRetry = vi.fn();
    const beforeRequest = vi.fn();

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('Service Unavailable', { status: 503 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      retry: {
        attempts: 1,
        retryOn: ['5xx'],
        backoff: 'fixed',
        baseDelayMs: 100,
      },
      hooks: {
        beforeRequest,
        onRetry,
      },
    });

    await expect(client.get('/health')).resolves.toEqual({ ok: true });

    expect(beforeRequest).toHaveBeenCalledTimes(2);
    expect(onRetry).toHaveBeenCalledTimes(1);

    const [beforeFirst] = getFirstMockCall(beforeRequest);
    const [beforeSecond] = getSecondMockCall(beforeRequest);
    const [retryCtx] = getFirstMockCall(onRetry);

    expect(beforeFirst.requestId).toBe(beforeSecond.requestId);
    expect(beforeFirst.requestId).toBe(retryCtx.requestId);
  });
});
