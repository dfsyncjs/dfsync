import { describe, expect, it, vi } from 'vitest';

import {
  createClient,
  HttpError,
  NetworkError,
  ParseError,
  RequestAbortedError,
  TimeoutError,
  ValidationError,
} from '../../src';
import { getFirstMockCall } from '../testUtils';

function jsonResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function createAbortError(): Error {
  const abortError = new Error('The operation was aborted');
  abortError.name = 'AbortError';

  return abortError;
}

describe('response parsing failures', () => {
  it('throws ParseError when a custom parser fails on a successful response', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse('{}'));
    const cause = new Error('cannot parse');

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      parseResponse: () => {
        throw cause;
      },
    });

    try {
      await client.get('/users/1');
      expect.unreachable('expected ParseError');
    } catch (error) {
      expect(error).toBeInstanceOf(ParseError);
      expect(error).not.toBeInstanceOf(NetworkError);
      expect((error as ParseError).code).toBe('PARSE_ERROR');
      expect((error as ParseError).cause).toBe(cause);
      expect((error as ParseError).response.status).toBe(200);
    }
  });

  it('throws ParseError when the default parser receives malformed JSON', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse('{ not json'));

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
    });

    await expect(client.get('/users/1')).rejects.toBeInstanceOf(ParseError);
  });

  it('attaches request context metadata to ParseError', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse('{ not json'));

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
    });

    try {
      await client.get('/users/1', { requestId: 'req_parse' });
      expect.unreachable('expected ParseError');
    } catch (error) {
      expect(error).toBeInstanceOf(ParseError);
      expect((error as ParseError).requestId).toBe('req_parse');
      expect((error as ParseError).attempt).toBe(0);
      expect((error as ParseError).durationMs).toBeTypeOf('number');
    }
  });

  it('runs the onError hook for parsing failures', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse('{ not json'));
    const onError = vi.fn();

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      hooks: { onError },
    });

    await expect(client.get('/users/1')).rejects.toBeInstanceOf(ParseError);

    const [ctx] = getFirstMockCall(onError);
    expect((ctx as { error: unknown }).error).toBeInstanceOf(ParseError);
  });

  it('does not retry parsing failures even when network errors are retryable', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse('{ not json'));

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      retry: {
        attempts: 3,
        baseDelayMs: 0,
        retryOn: ['network-error', '5xx', '429'],
      },
    });

    await expect(client.get('/users/1')).rejects.toBeInstanceOf(ParseError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('classifies a failed response by its status when parsing fails', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response('<html>Not Found</html>', {
        status: 404,
        statusText: 'Not Found',
        headers: { 'content-type': 'application/json' },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
    });

    try {
      await client.get('/users/999');
      expect.unreachable('expected HttpError');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError);
      expect(error).not.toBeInstanceOf(ParseError);
      expect((error as HttpError).status).toBe(404);
      expect((error as HttpError).data).toBeUndefined();
    }

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('still retries 5xx responses whose body cannot be parsed', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response('<html>Server Error</html>', {
          status: 503,
          headers: { 'content-type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(jsonResponse(JSON.stringify({ id: 'user-1' })));

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      retry: {
        attempts: 1,
        baseDelayMs: 0,
        retryOn: ['5xx'],
      },
    });

    await expect(client.get('/users/1')).resolves.toEqual({ id: 'user-1' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('preserves cancellation classification when parsing is aborted', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse('{}'));
    const controller = new AbortController();

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      parseResponse: () =>
        new Promise((_resolve, reject) => {
          if (controller.signal.aborted) {
            reject(createAbortError());
            return;
          }

          controller.signal.addEventListener('abort', () => {
            reject(createAbortError());
          });
        }),
    });

    const promise = client.get('/users/1', { signal: controller.signal });

    controller.abort();

    await expect(promise).rejects.toBeInstanceOf(RequestAbortedError);
  });

  it('preserves timeout classification when parsing throws an abort error', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse('{}'));

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      parseResponse: () => {
        throw createAbortError();
      },
    });

    await expect(client.get('/users/1')).rejects.toBeInstanceOf(TimeoutError);
  });

  it('does not re-wrap a DfsyncError thrown by a custom parser', async () => {
    const response = jsonResponse('{}');
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(response);

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      parseResponse: () => {
        throw new ValidationError(response, { id: 1 });
      },
    });

    try {
      await client.get('/users/1');
      expect.unreachable('expected ValidationError');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect(error).not.toBeInstanceOf(ParseError);
    }
  });

  it('keeps NetworkError for transport failures', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockRejectedValue(new Error('connection refused'));

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
    });

    try {
      await client.get('/users/1');
      expect.unreachable('expected NetworkError');
    } catch (error) {
      expect(error).toBeInstanceOf(NetworkError);
      expect(error).not.toBeInstanceOf(ParseError);
    }
  });
});
