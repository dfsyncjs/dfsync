import type { ExecutionContext } from './execution-context';

export function applyRequestMetadata(execution: ExecutionContext): void {
  execution.headers['x-request-id'] = execution.headers['x-request-id'] ?? execution.requestId;

  if (execution.request.idempotencyKey) {
    execution.headers['idempotency-key'] =
      execution.headers['idempotency-key'] ?? execution.request.idempotencyKey;
  }
}
