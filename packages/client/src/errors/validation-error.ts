import { DfsyncError } from './base-error';

export class ValidationError extends DfsyncError {
  public readonly data: unknown;
  public readonly response: Response;
  /** Adapter-specific validation details (e.g. schema issues), when available. */
  public readonly issues?: unknown;

  constructor(response: Response, data: unknown, issues?: unknown) {
    super('Response validation failed', 'VALIDATION_ERROR');

    this.name = 'ValidationError';
    this.response = response;
    this.data = data;
    this.issues = issues;
  }
}
