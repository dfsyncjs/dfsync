import type { HeadersMap } from './common';
import type { AuthConfig } from './auth';
import type { HooksConfig } from './hooks';
import type { RequestConfig, RequestMethod } from './request';

export type ResponseValidator<TData = unknown> = (
  data: TData,
) => boolean | void | Promise<boolean | void>;

/**
 * Result returned by a validation adapter. `success` decides whether validation
 * passes. `data` is reserved for future response transformation and is not used
 * to replace the response in this version. `error` carries adapter-specific
 * details (e.g. schema issues) and is surfaced on the thrown `ValidationError`.
 */
export type ValidationResult<TData = unknown> = {
  success: boolean;
  data?: TData;
  error?: unknown;
};

/**
 * A `safeParse`-style validation adapter. It receives the parsed response data
 * and returns a `ValidationResult`. Adapters are lightweight wrappers around a
 * schema library and must not introduce a runtime dependency into the core.
 */
export type ValidationAdapter<TData = unknown> = (
  data: unknown,
) => ValidationResult<TData> | Promise<ValidationResult<TData>>;

/** Lightweight context passed to custom serializers and parsers. */
export type SerializerContext = {
  request: RequestConfig;
  requestId: string;
};

export type SerializedBody = {
  body: BodyInit;
  /** Content type to set when the caller has not provided one. */
  contentType?: string;
};

/**
 * Serializes a request body into a `fetch`-compatible body. Called only when a
 * body is present. When not configured, bodies are serialized as JSON (objects)
 * or sent as-is (strings).
 */
export type BodySerializer = (
  body: unknown,
  ctx: SerializerContext,
) => SerializedBody | Promise<SerializedBody>;

/**
 * Parses a response into data. Runs for every response (successful and error)
 * before classification and validation, preserving the default pipeline stages.
 * When not configured, JSON responses are parsed as JSON and everything else as
 * text (with `204` yielding `undefined`).
 */
export type ResponseParser = (
  response: Response,
  ctx: SerializerContext,
) => unknown | Promise<unknown>;

export type RetryCondition = 'network-error' | '5xx' | '429';
export type RetryBackoff = 'fixed' | 'exponential';

export type RetryPredicateContext = {
  error: Error;
  attempt: number;
  maxAttempts: number;
  requestId: string;
  method: RequestMethod;
};

/**
 * Additional, user-defined retry gate. It is consulted only after the built-in
 * rules already decided a request is retryable, so it can further restrict
 * retries but can never make non-retryable errors (e.g. validation failures or
 * 4xx responses) retryable.
 */
export type RetryPredicate = (ctx: RetryPredicateContext) => boolean;

export type RetryConfig = {
  attempts?: number;
  backoff?: RetryBackoff;
  baseDelayMs?: number;
  retryOn?: RetryCondition[];
  retryMethods?: RequestMethod[];
  /**
   * Overall retry budget in milliseconds, measured from the first attempt. When
   * the next delay would push the elapsed time past this budget, retrying stops
   * and the last error is thrown instead of waiting.
   */
  maxElapsedMs?: number;
  /** Applies full jitter to backoff delays. Does not affect `Retry-After`. */
  jitter?: boolean;
  shouldRetry?: RetryPredicate;
};

export type ClientConfig = {
  baseUrl: string;
  timeout?: number;
  headers?: HeadersMap;
  auth?: AuthConfig;
  hooks?: HooksConfig;
  retry?: RetryConfig;
  fetch?: typeof globalThis.fetch;
  validateResponse?: ResponseValidator;
  responseSchema?: ValidationAdapter;
  serializeBody?: BodySerializer;
  parseResponse?: ResponseParser;
};
