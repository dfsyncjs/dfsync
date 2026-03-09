import { describe, expect, it } from 'vitest';
import { DfsyncError } from '../../src/errors/base-error';
import { TimeoutError } from '../../src/errors/timeout-error';

describe('TimeoutError', () => {
  it('sets timeout-specific message, code and timeout', () => {
    const cause = new Error('AbortError');
    const error = new TimeoutError(2500, cause);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DfsyncError);
    expect(error.name).toBe('TimeoutError');
    expect(error.message).toBe('Request timed out after 2500ms');
    expect(error.code).toBe('TIMEOUT_ERROR');
    expect(error.timeout).toBe(2500);
    expect(error.cause).toBe(cause);
  });
});
