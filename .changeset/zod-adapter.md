---
'@dfsync/client': minor
---

Add a zod validation adapter available from the `@dfsync/client/adapters/zod` subpath.
`zodAdapter(schema)` wraps a zod schema into a `responseSchema` `ValidationAdapter`; on
failure the zod error is surfaced on `ValidationError.issues`. `zod` is an optional peer
dependency and the adapter adds no runtime dependency to the core package — it is typed
structurally against `safeParse`, so it works across zod versions.
