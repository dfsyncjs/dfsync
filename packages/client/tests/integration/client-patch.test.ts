import { describe, expect, it, vi } from 'vitest';

import { createClient } from '../../src/core/create-client';
import { getFirstFetchInit, getFirstMockCall } from '../testUtils';

describe('client.patch', () => {
  it('sends PATCH request with body', async () => {
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit): Promise<Response> => {
        return new Response(JSON.stringify({ success: true }), {
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

    const body = { name: 'John' };

    const result = await client.patch('/users/1', body);

    expect(result).toEqual({ success: true });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [input] = getFirstMockCall(fetchMock);
    const init = getFirstFetchInit(fetchMock);

    expect(input).toBe('https://api.test.com/users/1');
    expect(init?.method).toBe('PATCH');
    expect(init?.body).toBe(JSON.stringify(body));
  });

  it('works without body', async () => {
    const fetchMock = vi.fn(async (): Promise<Response> => {
      return new Response(null, { status: 204 });
    });

    const client = createClient({
      baseUrl: 'https://api.test.com',
      fetch: fetchMock,
    });

    await client.patch('/users/1');

    const init = getFirstFetchInit(fetchMock);
    expect(init?.method).toBe('PATCH');
    expect(init?.body).toBeUndefined();
  });
});
