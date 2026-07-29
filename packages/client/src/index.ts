export { createClient } from './core/create-client';
export { createTelemetryHooks } from './core/telemetry';

export { DfsyncError } from './errors/base-error';
export { HttpError } from './errors/http-error';
export { NetworkError } from './errors/network-error';
export { ParseError } from './errors/parse-error';
export { TimeoutError } from './errors/timeout-error';
export { ValidationError } from './errors/validation-error';
export { RequestAbortedError } from './errors/request-aborted-error';

export type { AuthConfig, AuthContext, AuthProvider } from './types/auth';
export type { TelemetryExporter } from './core/telemetry';
export type { Client } from './types/client';
export type {
  ClientConfig,
  RetryConfig,
  RetryCondition,
  RetryBackoff,
  RetryPredicate,
  RetryPredicateContext,
  ResponseValidator,
  ValidationAdapter,
  ValidationResult,
  BodySerializer,
  ResponseParser,
  SerializedBody,
  SerializerContext,
} from './types/config';
export type {
  AfterResponseContext,
  BeforeRequestContext,
  ErrorContext,
  HooksConfig,
  HookAfterResponse,
  HookBeforeRequest,
  HookOnError,
  HookOnRetry,
  RetryContext,
  RetrySource,
} from './types/hooks';
export type { RequestConfig, RequestMethod, RequestOptions } from './types/request';
