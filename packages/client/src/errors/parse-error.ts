import { DfsyncError } from './base-error';

/**
 * Thrown when a successful HTTP response body cannot be parsed, either by the
 * default parser or by a configured `parseResponse`. Parsing failures are
 * contract errors, not transport errors, so they are never retried.
 */
export class ParseError extends DfsyncError {
  public readonly response: Response;

  constructor(response: Response, cause?: unknown) {
    super('Response parsing failed', 'PARSE_ERROR', cause);

    this.name = 'ParseError';
    this.response = response;
  }
}
