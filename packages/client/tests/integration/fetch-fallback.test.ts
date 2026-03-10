import { afterEach, describe, expect, it, vi } from 'vitest';
import { createClient } from '../../src/core/create-client';
import { getFirstMockCall } from '../testUtils';

describe('fetch fallback', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses globalThis.fetch when fetch is not provided in client config', async () => {
    const globalFetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    vi.stubGlobal('fetch', globalFetchMock);

    const client = createClient({
      baseUrl: 'https://api.test.com',
    });

    const result = await client.get('/health');

    expect(result).toEqual({ ok: true });

    const [url, init] = getFirstMockCall(globalFetchMock);

    expect(url).toBe('https://api.test.com/health');
    expect(init?.method).toBe('GET');
  });
});
