---
'@dfsync/client': minor
---

Classify response parsing failures correctly instead of reporting them as network errors.

Previously, any failure while parsing a response body — including malformed JSON handled by
the default parser — was normalized into `NetworkError`. That misrepresented a contract
error as a transport error, made it retryable by default (`retryOn` includes
`network-error`), and masked the HTTP status of failed responses entirely.

**Behavior changes**

- A successful response whose body cannot be parsed now throws the new `ParseError`
  (`code: 'PARSE_ERROR'`), which exposes `response` and the original failure as `cause`.
  Like `ValidationError`, it is a contract error and is never retried.
- A failed response is now classified by its status even when its body cannot be parsed, so
  a `404` with an unparsable body throws `HttpError` with `data` left `undefined` instead of
  `NetworkError`. Retry behavior for failed responses is unchanged — a `5xx` with an
  unparsable body is still retried according to `retryOn`.
- Abort errors raised while parsing keep their own classification (`TimeoutError` or
  `RequestAbortedError`), and a `DfsyncError` thrown by a custom parser is never re-wrapped.

Code that relied on catching `NetworkError` for malformed response bodies must now catch
`ParseError`. Transport failures continue to throw `NetworkError`.

**New export**

- `ParseError`
