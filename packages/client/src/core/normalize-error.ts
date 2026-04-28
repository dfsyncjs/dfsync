import { DfsyncError } from '../errors/base-error';
import { NetworkError } from '../errors/network-error';
import { TimeoutError } from '../errors/timeout-error';
import { RequestAbortedError } from '../errors/request-aborted-error';
import type { RequestAbortReason } from './create-request-controller';

export function normalizeError(
  error: unknown,
  timeout: number,
  abortReason?: RequestAbortReason,
): Error {
  if (error instanceof DfsyncError) {
    return error;
  }

  if (error instanceof Error && error.name === 'AbortError') {
    if (abortReason === 'external') {
      return new RequestAbortedError(error);
    }

    return new TimeoutError(timeout, error);
  }

  return new NetworkError('Network request failed', error);
}
