import { describe, expect, it } from 'vitest';

import { normalizeError } from '../../src/core/normalize-error';
import { HttpError } from '../../src/errors/http-error';
import { NetworkError } from '../../src/errors/network-error';
import { RequestAbortedError } from '../../src/errors/request-aborted-error';
import { TimeoutError } from '../../src/errors/timeout-error';

describe('normalizeError', () => {
  it('returns HttpError as-is', () => {
    const httpError = new HttpError(new Response(null, { status: 500 }));

    expect(normalizeError(httpError, 1000)).toBe(httpError);
  });

  it('returns TimeoutError for timeout aborts', () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';

    const error = normalizeError(abortError, 1000, 'timeout');

    expect(error).toBeInstanceOf(TimeoutError);
  });

  it('returns RequestAbortedError for external aborts', () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';

    const error = normalizeError(abortError, 1000, 'external');

    expect(error).toBeInstanceOf(RequestAbortedError);
  });

  it('returns NetworkError for other errors', () => {
    const error = normalizeError(new Error('socket hang up'), 1000);

    expect(error).toBeInstanceOf(NetworkError);
  });
});
