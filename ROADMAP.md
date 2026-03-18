# dfsync Roadmap

This document outlines the planned direction for **dfsync** and its packages.

## @dfsync/client

A lightweight HTTP client for reliable service-to-service communication.

### 0.4.x - 0.5.x — API completeness

Focus: method surface and developer experience.

Delivered / planned improvements:

- PATCH method support
- improved method typing
- better examples and documentation

### 0.6.x — Request lifecycle

**Focus**: request control and lifecycle management.

Planned features:

- AbortSignal support for request cancellation
- request context object for passing metadata through lifecycle
- correlation ID support (e.g. `x-request-id`)
- improved hook context with additional execution details

---

### 0.7.x — Observability

**Focus**: logging, monitoring, and request insights.

Planned features:

- request duration tracking
- retry metadata (attempt number, delay, etc.)
- support for `Retry-After` response header
- retry lifecycle hooks (`onRetry`)

---

### 0.8.x — Integration safety

**Focus**: safer and more predictable integrations.

Planned features:

- response validation (custom or schema-based)
- idempotency key support for safe retries

### Notes

- Versions below `1.0.0` may introduce breaking changes.
- The API will be stabilized before the `1.0.0` release.
- The roadmap may evolve based on real-world usage and feedback.
