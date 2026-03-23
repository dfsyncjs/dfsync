---
'@dfsync/client': minor
---

Add request lifecycle support.

This release introduces a predictable and controllable request lifecycle for service-to-service communication.

New features:

- AbortSignal support with proper cancellation handling
- request context with execution metadata (requestId, attempt, startedAt, signal)
- request ID propagation via `x-request-id`
- improved lifecycle hook context

Additional improvements:

- distinguish between timeout and manual cancellation (`TimeoutError` vs `RequestAbortedError`)
- external aborts are not retried
- clearer request metadata handling
