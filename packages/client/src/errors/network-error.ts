import { DfsyncError } from './base-error';

export class NetworkError extends DfsyncError {
  constructor(message = 'Network request failed', cause?: unknown) {
    super(message, 'NETWORK_ERROR', cause);

    this.name = 'NetworkError';
  }
}
