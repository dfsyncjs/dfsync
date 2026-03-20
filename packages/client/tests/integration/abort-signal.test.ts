import { describe, expect, it, vi } from 'vitest';

import { createClient } from '../../src/core/create-client';
import { RequestAbortedError } from '../../src/errors/request-aborted-error';
import { getFirstFetchInit } from '../testUtils';

describe('client abort signal', () => {
  it('throws RequestAbortedError when request is aborted via external signal', async () => {
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
      timeout: 1000,
      fetch: fetchMock,
    });

    const controller = new AbortController();

    const promise = client.get('/slow', {
      signal: controller.signal,
    });

    controller.abort();

    await expect(promise).rejects.toBeInstanceOf(RequestAbortedError);
  });

  it('passes the external signal to fetch', async () => {
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit): Promise<Response> => {
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: {
            'content-type': 'application/json',
          },
        });
      },
    );

    const client = createClient({
      baseUrl: 'https://api.test.com',
      fetch: fetchMock,
    });

    const controller = new AbortController();

    await client.get('/users', {
      signal: controller.signal,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const init = getFirstFetchInit(fetchMock);
    expect(init?.signal).toBeDefined();
  });

  it('does not retry when request is aborted via external signal', async () => {
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
      timeout: 1000,
      fetch: fetchMock,
      retry: { attempts: 2 },
    });

    const controller = new AbortController();

    const promise = client.get('/slow', {
      signal: controller.signal,
    });

    controller.abort();

    await expect(promise).rejects.toBeInstanceOf(RequestAbortedError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
