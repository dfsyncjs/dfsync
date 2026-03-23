import { DfsyncError } from './base-error';

export class RequestAbortedError extends DfsyncError {
  constructor(cause?: unknown) {
    super('Request was aborted', 'REQUEST_ABORTED', cause);
    this.name = 'RequestAbortedError';
  }
}
