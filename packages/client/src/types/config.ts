import type { HooksConfig } from "./hooks";
import type { HeadersMap } from "./common";
import type { RequestMethod } from "./request";

export type RetryCondition = "network-error" | "5xx" | "429";
export type RetryBackoff = "fixed" | "exponential";

export type RetryConfig = {
  attempts?: number;
  backoff?: RetryBackoff;
  baseDelayMs?: number;
  retryOn?: RetryCondition[];
  retryMethods?: RequestMethod[];
};

export type AuthConfig =
  | {
  type: "bearer";
  token: string;
}
  | {
  type: "apiKey";
  key: string;
  header?: string;
  prefix?: string;
}
  | {
  type: "custom";
  apply: (headers: HeadersMap) => void | Promise<void>;
};

export type TracingConfig = {
  enabled?: boolean;
  requestIdHeader?: string;
  correlationIdHeader?: string;
  serviceNameHeader?: string;
  serviceName?: string;
  generateRequestId?: () => string;
  generateCorrelationId?: () => string;
};

export type ClientConfig = {
  baseUrl: string;
  timeout?: number;
  headers?: HeadersMap;
  retry?: RetryConfig;
  auth?: AuthConfig;
  hooks?: HooksConfig;
  tracing?: TracingConfig;
  fetch?: typeof globalThis.fetch;
};
