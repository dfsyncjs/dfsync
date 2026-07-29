import { describe, expect, it } from 'vitest';

import { resolveResponseValidator } from '../../src/core/resolve-response-validator';
import type { ClientConfig, ValidationAdapter, ResponseValidator } from '../../src/types/config';
import type { RequestConfig } from '../../src/types/request';

const baseClient: ClientConfig = { baseUrl: 'https://api.example.com' };
const baseRequest: RequestConfig = { method: 'GET', path: '/users' };

const schemaA: ValidationAdapter = () => ({ success: true });
const schemaB: ValidationAdapter = () => ({ success: true });
const predicateA: ResponseValidator = () => true;
const predicateB: ResponseValidator = () => true;

describe('resolveResponseValidator', () => {
  it('returns undefined when nothing is configured', () => {
    expect(resolveResponseValidator(baseClient, baseRequest)).toBeUndefined();
  });

  it('prefers request-level schema over everything', () => {
    const result = resolveResponseValidator(
      { ...baseClient, responseSchema: schemaB, validateResponse: predicateB },
      { ...baseRequest, responseSchema: schemaA, validateResponse: predicateA },
    );

    expect(result).toEqual({ schema: schemaA });
  });

  it('prefers request-level predicate over client-level options', () => {
    const result = resolveResponseValidator(
      { ...baseClient, responseSchema: schemaB, validateResponse: predicateB },
      { ...baseRequest, validateResponse: predicateA },
    );

    expect(result).toEqual({ predicate: predicateA });
  });

  it('prefers client-level schema over client-level predicate', () => {
    const result = resolveResponseValidator(
      { ...baseClient, responseSchema: schemaB, validateResponse: predicateB },
      baseRequest,
    );

    expect(result).toEqual({ schema: schemaB });
  });

  it('falls back to client-level predicate', () => {
    const result = resolveResponseValidator(
      { ...baseClient, validateResponse: predicateB },
      baseRequest,
    );

    expect(result).toEqual({ predicate: predicateB });
  });
});
