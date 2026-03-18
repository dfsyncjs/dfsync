import type { ExecutionContext } from './execution-context';

export function applyRequestMetadata(execution: ExecutionContext): void {
  execution.headers['x-request-id'] = execution.headers['x-request-id'] ?? execution.requestId;
}
