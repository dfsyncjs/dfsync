import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { createClient, ValidationError } from '../../src';
import { zodAdapter } from '../../src/adapters/zod';

const userSchema = z.object({ id: z.string() });

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('zodAdapter', () => {
  it('produces a passing ValidationResult for valid data', async () => {
    const adapter = zodAdapter(userSchema);

    expect(await adapter({ id: 'user-1' })).toEqual({ success: true, data: { id: 'user-1' } });
  });

  it('produces a failing ValidationResult with the zod error', async () => {
    const adapter = zodAdapter(userSchema);
    const result = await adapter({ name: 'Roman' });

    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(z.ZodError);
  });

  it('works as a responseSchema and returns data on success', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ id: 'user-1' }));

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      responseSchema: zodAdapter(userSchema),
    });

    await expect(client.get('/users/1')).resolves.toEqual({ id: 'user-1' });
  });

  it('throws ValidationError with zod issues on failure', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ name: 'Roman' }));

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      responseSchema: zodAdapter(userSchema),
    });

    try {
      await client.get('/users/1');
      expect.unreachable('expected ValidationError');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).issues).toBeInstanceOf(z.ZodError);
    }
  });
});
