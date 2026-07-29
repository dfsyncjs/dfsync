import type {
  AfterResponseContext,
  BeforeRequestContext,
  ErrorContext,
  HooksConfig,
  RetryContext,
} from '../types/hooks';

/**
 * Stable telemetry exporter interface. An exporter is a telemetry sink that
 * observes the request lifecycle. Each method receives the same context objects
 * as the corresponding lifecycle hooks, so no internal state is exposed.
 *
 * Exporters do not run themselves — map an exporter onto the client's `hooks`
 * with `createTelemetryHooks`. This keeps telemetry on the existing hook
 * mechanism instead of introducing a separate runtime path.
 */
export type TelemetryExporter = {
  onRequestStart?(ctx: BeforeRequestContext): void | Promise<void>;
  onRequestSuccess?(ctx: AfterResponseContext): void | Promise<void>;
  onRequestError?(ctx: ErrorContext): void | Promise<void>;
  onRequestRetry?(ctx: RetryContext): void | Promise<void>;
};

/**
 * Maps a `TelemetryExporter` onto a `HooksConfig` so it can be passed to
 * `createClient({ hooks })`. Only the methods the exporter defines are wired.
 */
export function createTelemetryHooks(exporter: TelemetryExporter): HooksConfig {
  const { onRequestStart, onRequestSuccess, onRequestError, onRequestRetry } = exporter;

  const hooks: HooksConfig = {};

  if (onRequestStart) {
    hooks.beforeRequest = onRequestStart;
  }

  if (onRequestSuccess) {
    hooks.afterResponse = onRequestSuccess;
  }

  if (onRequestError) {
    hooks.onError = onRequestError;
  }

  if (onRequestRetry) {
    hooks.onRetry = onRequestRetry;
  }

  return hooks;
}
