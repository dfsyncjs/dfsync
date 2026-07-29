---
'@dfsync/client': minor
---

Add serializer and parser extensibility. Two optional hooks let you override the default
JSON pipeline at the client or request level:

- `serializeBody(body, ctx)` — turns a request body into a `fetch`-compatible body and may
  suggest a `contentType` (applied only when the caller has not set one). Called only when
  a body is present.
- `parseResponse(response, ctx)` — turns a response into data. It runs for every response
  (successful and error) before classification and validation, so `HttpError.data` and
  `validateResponse` both operate on the parsed value.

Backward compatible — both options are optional and the default behavior (JSON for object
bodies, content-type-based parsing, `204` → `undefined`) is preserved when they are not
configured. Error handling and validation stages are unchanged.
