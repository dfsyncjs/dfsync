import { HttpError } from '../errors/http-error';
import { NetworkError } from '../errors/network-error';
import { TimeoutError } from '../errors/timeout-error';

export function normalizeError(error: unknown, timeout: number): Error {
  if (error instanceof HttpError) {
    return error;
  }

  if (error instanceof Error && error.name === 'AbortError') {
    return new TimeoutError(timeout, error);
  }

  return new NetworkError('Network request failed', error);
}
