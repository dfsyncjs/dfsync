import { describe, expect, it, vi } from 'vitest';

import { createClient, ValidationError } from '../../src';
import { getFirstMockCall } from '../testUtils';

describe('response validation', () => {
  it('returns data when client-level validation passes', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 'user-1' }), {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      validateResponse(data) {
        return typeof data === 'object' && data !== null && 'id' in data;
      },
    });

    await expect(client.get('/users/1')).resolves.toEqual({ id: 'user-1' });
  });

  it('throws ValidationError when client-level validation fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ name: 'Roman' }), {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      validateResponse(data) {
        return typeof data === 'object' && data !== null && 'id' in data;
      },
    });

    await expect(client.get('/users/1')).rejects.toBeInstanceOf(ValidationError);
  });

  it('uses request-level validation over client-level validation', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ name: 'Roman' }), {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      validateResponse() {
        return false;
      },
    });

    await expect(
      client.get('/users/1', {
        validateResponse(data) {
          return typeof data === 'object' && data !== null && 'name' in data;
        },
      }),
    ).resolves.toEqual({ name: 'Roman' });
  });

  it('supports async validation', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 'user-1' }), {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      async validateResponse(data) {
        return typeof data === 'object' && data !== null && 'id' in data;
      },
    });

    await expect(client.get('/users/1')).resolves.toEqual({ id: 'user-1' });
  });

  it('does not retry when response validation fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ name: 'Roman' }), {
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
        attempts: 3,
        retryOn: ['network-error', '5xx', '429'],
        retryMethods: ['GET'],
      },
      validateResponse(data) {
        return typeof data === 'object' && data !== null && 'id' in data;
      },
    });

    await expect(client.get('/users/1')).rejects.toBeInstanceOf(ValidationError);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('exposes validation result in afterResponse hook when validation passes', async () => {
    const afterResponse = vi.fn();

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 'user-1' }), {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      hooks: {
        afterResponse,
      },
      validateResponse(data) {
        return typeof data === 'object' && data !== null && 'id' in data;
      },
    });

    await client.get('/users/1');

    expect(afterResponse).toHaveBeenCalledTimes(1);
    expect(afterResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        validation: {
          enabled: true,
          passed: true,
        },
      }),
    );
  });

  it('does not expose validation result when validation is not configured', async () => {
    const afterResponse = vi.fn();

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 'user-1' }), {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      hooks: {
        afterResponse,
      },
    });

    await client.get('/users/1');

    expect(afterResponse).toHaveBeenCalledTimes(1);
    const ctx = getFirstMockCall(afterResponse);
    expect(ctx).not.toHaveProperty('validation');
  });

  it('returns data when a responseSchema adapter succeeds', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 'user-1' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      responseSchema(data) {
        const ok = typeof data === 'object' && data !== null && 'id' in data;
        return ok ? { success: true, data } : { success: false };
      },
    });

    await expect(client.get('/users/1')).resolves.toEqual({ id: 'user-1' });
  });

  it('throws ValidationError with issues when a responseSchema adapter fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ name: 'Roman' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      responseSchema() {
        return { success: false, error: [{ path: 'id', message: 'Required' }] };
      },
    });

    try {
      await client.get('/users/1');
      expect.unreachable('expected ValidationError');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).issues).toEqual([{ path: 'id', message: 'Required' }]);
    }
  });

  it('does not retry when a responseSchema adapter fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ name: 'Roman' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      retry: {
        attempts: 3,
        retryOn: ['network-error', '5xx', '429'],
        retryMethods: ['GET'],
      },
      responseSchema() {
        return { success: false };
      },
    });

    await expect(client.get('/users/1')).rejects.toBeInstanceOf(ValidationError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('prefers responseSchema over validateResponse at the client level', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 'user-1' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const validateResponse = vi.fn().mockReturnValue(false);

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      validateResponse,
      responseSchema() {
        return { success: true };
      },
    });

    await expect(client.get('/users/1')).resolves.toEqual({ id: 'user-1' });
    expect(validateResponse).not.toHaveBeenCalled();
  });

  it('lets a request-level validateResponse override a client-level responseSchema', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 'user-1' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      responseSchema() {
        return { success: false };
      },
    });

    await expect(
      client.get('/users/1', {
        validateResponse() {
          return true;
        },
      }),
    ).resolves.toEqual({ id: 'user-1' });
  });

  it('exposes validation metadata in afterResponse for a passing responseSchema', async () => {
    const afterResponse = vi.fn();

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 'user-1' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      hooks: { afterResponse },
      responseSchema() {
        return { success: true };
      },
    });

    await client.get('/users/1');

    expect(afterResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        validation: { enabled: true, passed: true },
      }),
    );
  });
});
