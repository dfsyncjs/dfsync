import { describe, expect, it, vi } from 'vitest';
import { createClient } from '../../src/core/create-client';
import { TimeoutError } from '../../src/errors/timeout-error';

describe('client timeout', () => {
  it('throws TimeoutError when request exceeds timeout', async () => {
    const fetchMock = vi.fn<typeof fetch>((_input, init) => {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          const abortError = new Error('The operation was aborted');
          abortError.name = 'AbortError';
          reject(abortError);
        });
      });
    });

    const client = createClient({
      baseUrl: 'https://api.test.com',
      timeout: 10,
      fetch: fetchMock,
    });

    await expect(client.get('/slow')).rejects.toBeInstanceOf(TimeoutError);
  });

  it('request timeout overrides client timeout', async () => {
    const fetchMock: typeof fetch = vi.fn((_input, init) => {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          const abortError = new Error('The operation was aborted');
          abortError.name = 'AbortError';
          reject(abortError);
        });
      });
    });

    const client = createClient({
      baseUrl: 'https://api.test.com',
      timeout: 1000,
      fetch: fetchMock,
    });

    await expect(client.get('/slow', { timeout: 10 })).rejects.toBeInstanceOf(TimeoutError);
  });
});
