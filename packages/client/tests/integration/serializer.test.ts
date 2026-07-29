import { describe, expect, it, vi } from 'vitest';

import { createClient, HttpError, ValidationError } from '../../src';
import { getFirstFetchInit, getFirstMockCall } from '../testUtils';

describe('serializer / parser extensibility', () => {
  it('uses a custom body serializer and sets its content type', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const serializeBody = vi.fn().mockReturnValue({
      body: 'a=1&b=2',
      contentType: 'application/x-www-form-urlencoded',
    });

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      serializeBody,
    });

    await client.post('/form', { a: 1, b: 2 });

    const init = getFirstFetchInit(fetchMock);
    expect(init.body).toBe('a=1&b=2');
    expect((init.headers as Record<string, string>)['content-type']).toBe(
      'application/x-www-form-urlencoded',
    );

    const [body, ctx] = getFirstMockCall(serializeBody);
    expect(body).toEqual({ a: 1, b: 2 });
    expect(ctx).toEqual(expect.objectContaining({ requestId: expect.any(String) }));
  });

  it('does not overwrite a user-provided content-type', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      serializeBody: () => ({ body: 'raw', contentType: 'text/plain' }),
    });

    await client.post('/form', { a: 1 }, { headers: { 'content-type': 'application/custom' } });

    const init = getFirstFetchInit(fetchMock);
    expect((init.headers as Record<string, string>)['content-type']).toBe('application/custom');
  });

  it('keeps default JSON serialization when no serializer is configured', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
    });

    await client.post('/users', { name: 'Roman' });

    const init = getFirstFetchInit(fetchMock);
    expect(init.body).toBe(JSON.stringify({ name: 'Roman' }));
    expect((init.headers as Record<string, string>)['content-type']).toBe('application/json');
  });

  it('uses a custom response parser for successful responses', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response('id=user-1', {
        status: 200,
        headers: { 'content-type': 'text/plain' },
      }),
    );

    const parseResponse = vi.fn(async (response: Response, _ctx: unknown) => {
      const text = await response.text();
      return Object.fromEntries(new URLSearchParams(text));
    });

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      parseResponse,
    });

    await expect(client.get('/users/1')).resolves.toEqual({ id: 'user-1' });
    expect(parseResponse).toHaveBeenCalledTimes(1);
    const [, ctx] = getFirstMockCall(parseResponse);
    expect(ctx).toEqual(expect.objectContaining({ requestId: expect.any(String) }));
  });

  it('uses the custom parser for error response bodies too', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response('code=not_found', {
        status: 404,
        statusText: 'Not Found',
        headers: { 'content-type': 'text/plain' },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      parseResponse: async (response) => {
        const text = await response.text();
        return Object.fromEntries(new URLSearchParams(text));
      },
    });

    try {
      await client.get('/users/999');
      expect.unreachable('expected HttpError');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError);
      expect((error as HttpError).data).toEqual({ code: 'not_found' });
    }
  });

  it('prefers request-level parser over client-level parser', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response('value', {
        status: 200,
        headers: { 'content-type': 'text/plain' },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      parseResponse: () => 'client-level',
    });

    await expect(
      client.get('/thing', {
        parseResponse: () => 'request-level',
      }),
    ).resolves.toBe('request-level');
  });

  it('runs validation against custom-parsed data', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response('name=Roman', {
        status: 200,
        headers: { 'content-type': 'text/plain' },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      parseResponse: async (response) => {
        const text = await response.text();
        return Object.fromEntries(new URLSearchParams(text));
      },
      validateResponse(data) {
        return typeof data === 'object' && data !== null && 'id' in data;
      },
    });

    await expect(client.get('/users/1')).rejects.toBeInstanceOf(ValidationError);
  });
});
