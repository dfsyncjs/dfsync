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

Focus: stabilizing core APIs, improving extensibility, and preparing `@dfsync/client` for production-scale usage and future SaaS integration.

Planned features:

- stable validation API (finalized `responseSchema` contract)
  - validation must run after response parsing
  - validation must not affect retry logic
  - validation adapters must follow a consistent interface
- validation adapters (starting with `zod`)
  - adapters must be lightweight wrappers
  - must not introduce runtime dependencies into core
  - must not change validation execution flow
- serializer / parser extensibility
  - must integrate into existing request/response pipeline
  - must not bypass error handling or validation stages
  - must preserve default JSON behavior when not configured
- improved retry model:
  - retry budget (`maxElapsedMs`)
  - jitter support
  - advanced retry conditions
  - must remain backward compatible with existing retry behavior
  - must preserve Retry-After handling
- finalized error model:
  - `HttpError`
  - `NetworkError`
  - `TimeoutError`
  - `AbortError`
  - `ValidationError`
  - must preserve backward compatibility
  - must not change existing error inheritance unexpectedly
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
  - must be minimal and explicit
  - must not expose internal implementation details
  - must be version-stable
- operation naming support (`operationName`)
  - must be part of request context
  - must be available in hooks and telemetry
- documentation restructuring (use-case oriented)

Constraints:

- no breaking changes in public API within 0.9.x
- avoid over-engineering in extensibility APIs
- new features must not introduce significant runtime overhead

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
