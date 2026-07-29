import type { ValidationAdapter } from '../types/config';

/**
 * Minimal structural shape of a zod schema's `safeParse`. Typing it structurally
 * keeps the adapter free of a build-time dependency on zod and compatible across
 * zod versions (and any other `safeParse`-compatible schema).
 */
export type ZodSafeParseSchema<T> = {
  safeParse(data: unknown): { success: true; data: T } | { success: false; error: unknown };
};

/**
 * Wraps a zod schema into a `@dfsync/client` `ValidationAdapter` for use as
 * `responseSchema`. On failure, the zod error is surfaced on
 * `ValidationError.issues`.
 *
 * @example
 * import { z } from 'zod';
 * import { zodAdapter } from '@dfsync/client/adapters/zod';
 *
 * const client = createClient({
 *   baseUrl: 'https://api.example.com',
 *   responseSchema: zodAdapter(z.object({ id: z.string() })),
 * });
 */
export function zodAdapter<T>(schema: ZodSafeParseSchema<T>): ValidationAdapter<T> {
  return (data) => {
    const result = schema.safeParse(data);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error };
  };
}
