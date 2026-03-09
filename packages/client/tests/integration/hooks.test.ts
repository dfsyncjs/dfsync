import { describe, expect, it, vi } from 'vitest';

import { HttpError } from '../../src/errors/http-error';
import { NetworkError } from '../../src/errors/network-error';
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
    const [, init] = firstCall!;
    expect((init?.headers as Record<string, string>)['x-request-id']).toBe('req-123');
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
    const [, init] = firstCall!;
    const headers = init?.headers as Record<string, string>;

    expect(headers['x-step-1']).toBe('done');
    expect(headers['x-step-2']).toBe('done-next');
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
});
