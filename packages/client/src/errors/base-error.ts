export class DfsyncError extends Error {
  public readonly code: string;
  public override readonly cause?: unknown;

  /**
   * Request context metadata attached when the error is thrown from the
   * request lifecycle. These fields are optional and may be undefined when the
   * error is created outside of a request (e.g. constructed manually in tests).
   */
  public requestId?: string;
  public attempt?: number;
  public durationMs?: number;

  constructor(message: string, code: string, cause?: unknown) {
    super(message);

    this.name = 'DfsyncError';
    this.code = code;
    this.cause = cause;
  }
}
