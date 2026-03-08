export { createClient } from "./core/create-client";

export { DfsyncError } from "./errors/base-error";
export { HttpError } from "./errors/http-error";
export { NetworkError } from "./errors/network-error";
export { TimeoutError } from "./errors/timeout-error";

export type { Client } from "./types/client";
export type {
  ClientConfig,
  RetryConfig,
  AuthConfig,
  TracingConfig,
} from "./types/config";
export type { RequestConfig, RequestOptions, RequestMethod } from "./types/request";
export type {
  HooksConfig,
  BeforeRequestContext,
  AfterResponseContext,
  ErrorContext,
} from "./types/hooks";
