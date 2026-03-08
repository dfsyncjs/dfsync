import type { AuthConfig, RetryConfig } from "./config";
import type { HeadersMap, QueryParams } from "./common";

export type RequestMethod = "GET" | "POST" | "PUT" | "DELETE";

export type RequestConfig = {
  method: RequestMethod;
  path: string;
  query?: QueryParams;
  body?: unknown;
  headers?: HeadersMap;
  timeout?: number;
  retry?: RetryConfig;
  auth?: AuthConfig;
};

export type RequestOptions = Omit<RequestConfig, "method" | "path" | "body">;
