---
'@dfsync/client': minor
---

Attach request context metadata to thrown errors. Every error that extends `DfsyncError`
(`HttpError`, `NetworkError`, `TimeoutError`, `ValidationError`, `RequestAbortedError`) now
carries optional `requestId`, `attempt`, and `durationMs` fields describing the request
that failed, so callers can correlate failures without lifecycle hooks. Response details
remain available on `HttpError` and `ValidationError` via their existing fields. Backward
compatible — the fields are optional, error constructors are unchanged, and errors created
outside a request lifecycle leave them undefined.
