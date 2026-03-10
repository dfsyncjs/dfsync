import { describe, expect, it } from 'vitest';
import { DfsyncError } from '../../src/errors/base-error';
import { NetworkError } from '../../src/errors/network-error';

describe('NetworkError', () => {
  it('sets default message and code', () => {
    const error = new NetworkError();

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DfsyncError);
    expect(error.name).toBe('NetworkError');
    expect(error.message).toBe('Network request failed');
    expect(error.code).toBe('NETWORK_ERROR');
  });

  it('accepts custom message and cause', () => {
    const cause = new Error('socket hang up');
    const error = new NetworkError('Custom network error', cause);

    expect(error.message).toBe('Custom network error');
    expect(error.cause).toBe(cause);
  });
});
