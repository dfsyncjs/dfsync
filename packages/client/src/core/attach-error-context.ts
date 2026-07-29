import { DfsyncError } from '../errors/base-error';
import type { ExecutionContext } from './execution-context';

/**
 * Enriches a thrown error with request lifecycle metadata (`requestId`,
 * `attempt`, `durationMs`) so callers can correlate failures without relying on
 * lifecycle hooks. Only `DfsyncError` instances are enriched; other errors are
 * left untouched. Response details are already exposed by `HttpError` and
 * `ValidationError` via their `response` field.
 */
export function attachErrorContext(error: Error, execution: ExecutionContext): void {
  if (!(error instanceof DfsyncError)) {
    return;
  }

  error.requestId = execution.requestId;
  error.attempt = execution.attempt;

  if (execution.durationMs !== undefined) {
    error.durationMs = execution.durationMs;
  }
}
