---
'@dfsync/client': minor
---

Add optional `operationName` request option. It is part of the request context and is
exposed in all lifecycle hooks (`beforeRequest`, `afterResponse`, `onRetry`, `onError`),
making it useful for logging, tracing, and telemetry. It is metadata only and does not
affect request behavior. Backward compatible — the field is optional and omitted from
hook contexts when not provided.
