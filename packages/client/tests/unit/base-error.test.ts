import { describe, expect, it } from 'vitest';
import { DfsyncError } from '../../src/errors/base-error';

describe('DfsyncError', () => {
  it('sets message, code, and cause', () => {
    const cause = new Error('root cause');
    const error = new DfsyncError('Something failed', 'TEST_ERROR', cause);

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('DfsyncError');
    expect(error.message).toBe('Something failed');
    expect(error.code).toBe('TEST_ERROR');
    expect(error.cause).toBe(cause);
  });
});
