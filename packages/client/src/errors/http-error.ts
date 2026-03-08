import { DfsyncError } from "./base-error";

export class HttpError extends DfsyncError {
  public readonly status: number;
  public readonly statusText: string;
  public readonly data?: unknown;
  public readonly response: Response;

  constructor(response: Response, data?: unknown) {
    super(
      `HTTP ${response.status} ${response.statusText}`,
      "HTTP_ERROR"
    );
    this.name = "HttpError";
    this.status = response.status;
    this.statusText = response.statusText;
    this.data = data;
    this.response = response;
  }
}
