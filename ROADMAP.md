# dfsync Roadmap

This document outlines the planned direction for **dfsync** and its packages.

## @dfsync/client

A lightweight HTTP client for reliable service-to-service communication.

### 0.4.x - 0.5.x — API completeness

Focus: method surface and developer experience.

Status: completed

Delivered:

- PATCH method support
- improved method typing
- better examples and documentation

### 0.6.x — Request lifecycle

Focus: request control and lifecycle management.

Status: completed

Delivered:

- abortSignal support (extended and stabilized)
- request context object for passing metadata through lifecycle
- correlation ID support (`x-request-id` propagation across services)
- improved hook context with additional execution details

---

### 0.7.x — Observability

Focus: logging, monitoring, and request insights.

Status: completed

Delivered:

- request timing metadata (`startedAt`, `endedAt`, `durationMs`)
- retry metadata (`attempt`, `maxAttempts`, `retryDelayMs`, `retryReason`)
- support for `Retry-After` response header
- retry lifecycle hook (`onRetry`)
- observability fields exposed in existing hook contexts

---

### 0.8.x — Integration safety

Focus: safer and more predictable integrations.

Status: completed

Delivered:

- response validation with client-level defaults and request-level overrides
- `ValidationError` for failed response validation
- validation result metadata in lifecycle hooks
- idempotency key support via the `idempotency-key` header
- safer retry behavior for non-idempotent requests

### 0.9.x — Platform readiness & API stabilization

Focus: stabilizing core APIs, improving extensibility, and preparing dfsync for production-scale usage and future SaaS integration.

Planned features:

- stable validation API (finalized `responseSchema` contract)
- validation adapters (starting with `zod`)
- serializer / parser extensibility (custom request/response handling)
- improved retry model:
  - retry budget (`maxElapsedMs`)
  - jitter support
  - advanced retry conditions
- finalized error model:
  - `HttpError`
  - `NetworkError`
  - `TimeoutError`
  - `AbortError`
  - `ValidationError`
- extended error metadata:
  - `requestId`
  - `attempt`
  - `duration`
  - optional response details
- stable public extension interfaces:
  - telemetry exporter interface
  - auth provider interface
  - validation adapter interface
  - retry policy interface
- operation naming support (`operationName` for requests)
- documentation restructuring (use-case oriented)

### 1.0.x — Stable core & production readiness

Focus: delivering a stable, well-documented, and production-ready API with long-term support guarantees.

Planned features:

- stable and fully documented public API
- finalized request lifecycle model
- production-ready retry and timeout behavior
- first-class validation support
- stable and versioned extension interfaces
- migration guide from 0.x
- production best practices documentation:
  - retries
  - timeouts
  - idempotency
  - observability
- compatibility guarantees (Node.js/runtime support)
- improved examples:
  - internal APIs
  - external integrations
  - background jobs / workers

### Future direction — dfsync Cloud (SaaS)

Focus: extending dfsync as a platform with observability, control, and reliability tooling for service-to-service communication.

Planned areas:

- request observability dashboard (latency, errors, retries)
- request tracing by `requestId`
- integration health monitoring
- centralized retry / timeout policy management
- alerting (error spikes, high latency)
- secure data handling (redaction / filtering)
- telemetry ingestion and analytics

### Notes

- versions below `1.0.0` may introduce breaking changes.
- the API will be stabilized before the `1.0.0` release.
- the roadmap may evolve based on real-world usage and feedback.
