---
'@dfsync/client': minor
---

Add stable public extension interfaces. Formalize the auth provider contract as
`AuthProvider` (and export `AuthContext`), and add a `TelemetryExporter` interface with a
`createTelemetryHooks(exporter)` helper that maps an exporter onto a standard `HooksConfig`
— no new runtime path in the core. Together with the already-exported `ValidationAdapter`
(validation adapter interface) and `RetryPredicate` (retry policy interface), these form
the minimal, version-stable extension surface. All additive and backward compatible.
