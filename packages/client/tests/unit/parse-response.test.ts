import { describe, expect, it } from 'vitest';
import { parseResponse } from '../../src/core/parse-response';

describe('parseResponse', () => {
  it('parses json response', async () => {
    const response = new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    });

    await expect(parseResponse(response)).resolves.toEqual({ ok: true });
  });

  it('parses text response', async () => {
    const response = new Response('hello', {
      status: 200,
      headers: {
        'content-type': 'text/plain',
      },
    });

    await expect(parseResponse(response)).resolves.toBe('hello');
  });

  it('returns undefined for 204', async () => {
    const response = new Response(null, { status: 204 });

    await expect(parseResponse(response)).resolves.toBeUndefined();
  });
});
