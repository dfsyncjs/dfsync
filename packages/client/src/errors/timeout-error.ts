import { DfsyncError } from "./base-error";

export class TimeoutError extends DfsyncError {
  public readonly timeout: number;

  constructor(timeout: number, cause?: unknown) {
    super(`Request timed out after ${timeout}ms`, "TIMEOUT_ERROR", cause);

    this.name = "TimeoutError";
    this.timeout = timeout;
  }
}
