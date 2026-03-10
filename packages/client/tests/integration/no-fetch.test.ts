import { afterEach, describe, expect, it, vi } from 'vitest';
import { createClient } from '../../src/core/create-client';

describe('no fetch implementation', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('throws when no fetch implementation is available', async () => {
    vi.stubGlobal('fetch', undefined);

    const client = createClient({
      baseUrl: 'https://api.test.com',
    });

    await expect(client.get('/users')).rejects.toThrow('No fetch implementation available');
  });
});
