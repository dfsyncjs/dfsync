---
'@dfsync/client': minor
---

Add a stable validation adapter API via `responseSchema`. It accepts a `safeParse`-style
`ValidationAdapter` returning `{ success, data?, error? }`; when `success` is `false` the
client throws a `ValidationError` and surfaces the adapter's `error` on the new
`ValidationError.issues` field. Validation still runs only after successful responses,
after parsing, and never triggers retries.

Precedence between `responseSchema` and the existing `validateResponse` predicate is
explicit: a request-level option beats a client-level one, and within the same level
`responseSchema` beats `validateResponse`. In this version validation does not replace the
response — the original parsed data is returned.

Backward compatible — `responseSchema` and `ValidationError.issues` are optional and the
existing `validateResponse` behavior is unchanged.
