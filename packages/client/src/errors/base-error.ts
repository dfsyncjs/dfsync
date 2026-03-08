export class DfsyncError extends Error {
  public readonly code: string;
  public override readonly cause?: unknown;

  constructor(message: string, code: string, cause?: unknown) {
    super(message);

    this.name = "DfsyncError";
    this.code = code;
    this.cause = cause;
  }
}
