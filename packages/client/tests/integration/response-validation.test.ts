import { describe, expect, it, vi } from 'vitest';

import { createClient, ValidationError } from '../../src';

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
});
