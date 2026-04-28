import { DfsyncError } from './base-error';

export class ValidationError extends DfsyncError {
  public readonly data: unknown;
  public readonly response: Response;

  constructor(response: Response, data: unknown) {
    super('Response validation failed', 'VALIDATION_ERROR');

    this.name = 'ValidationError';
    this.response = response;
    this.data = data;
  }
}
