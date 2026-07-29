---
'@dfsync/client': minor
---

Extend the retry model with an overall retry budget, jitter, and custom retry conditions:

- `retry.maxElapsedMs` — caps total time spent retrying (measured from the first attempt);
  when the next delay would exceed the budget, the last error is thrown instead of waiting.
- `retry.jitter` — applies full jitter to backoff delays to spread retries and avoid retry
  storms. Disabled by default and never applied to server-directed `Retry-After` delays.
- `retry.shouldRetry` — an optional predicate consulted only after the built-in rules
  already allow a retry, so it can further restrict retries but never make non-retryable
  errors (validation failures, `4xx`) retryable.

Backward compatible — all new options are optional, defaults are unchanged, and existing
`Retry-After` handling and retry semantics are preserved.
