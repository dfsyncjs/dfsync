import type { ClientConfig, ResponseValidator, ValidationAdapter } from '../types/config';
import type { RequestConfig } from '../types/request';

export type ResolvedResponseValidator =
  | { schema: ValidationAdapter }
  | { predicate: ResponseValidator };

/**
 * Picks the effective response validator. A request-level option takes
 * precedence over a client-level one, and within the same level a
 * `responseSchema` adapter takes precedence over a `validateResponse` predicate.
 * Returns `undefined` when no validation is configured.
 */
export function resolveResponseValidator(
  clientConfig: ClientConfig,
  request: RequestConfig,
): ResolvedResponseValidator | undefined {
  if (request.responseSchema) {
    return { schema: request.responseSchema };
  }

  if (request.validateResponse) {
    return { predicate: request.validateResponse };
  }

  if (clientConfig.responseSchema) {
    return { schema: clientConfig.responseSchema };
  }

  if (clientConfig.validateResponse) {
    return { predicate: clientConfig.validateResponse };
  }

  return undefined;
}
