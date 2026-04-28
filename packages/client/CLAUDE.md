# @dfsync/client — Development Context

This package provides a reliable HTTP client for service-to-service communication.

It is designed for backend services, microservices, workers, and integration services that need predictable HTTP communication.

## Scope

- Node.js / TypeScript HTTP client
- Service-to-service communication
- Predictable request lifecycle
- Consistent error handling
- Retry behavior with observability metadata
- Optional response validation
- Idempotency support for safer integrations

This package is NOT a browser-first data fetching library and should not introduce UI or frontend state-management concerns.

## Architecture

Core flow:

1. createExecutionContext
2. applyRequestMetadata
   - headers
   - requestId / correlation metadata
   - idempotency metadata when configured
3. execute fetch
4. parseResponse
5. classify result
   - successful HTTP response
   - retryable HTTP response
   - non-retryable HTTP error
   - network error
6. run retry logic when applicable
7. run response validation (if configured) only for successful responses
8. run lifecycle hooks
9. return parsed response or throw a `DfsyncError` (or one of its subclasses)

Do not refactor the request pipeline unless the task explicitly requires it.

## Key principles

### Error handling

- All internal errors must extend `DfsyncError`
- NEVER wrap `DfsyncError` into `NetworkError`
- Preserve original error types
- Preserve useful error metadata
- Do not hide the original cause when available
- Do not introduce generic `Error` when a specific `DfsyncError` subclass already exists

### Validation

- Validation runs only after successful HTTP responses
- Validation must run after response parsing
- Validation errors throw `ValidationError`
- Validation errors MUST NOT trigger retries
- Validation errors are contract errors, not transport errors
- Do not treat validation failures as `NetworkError` or retryable HTTP errors

### Retry

- Retry applies only to:
  - network errors
  - 5xx responses
  - 429 responses
- Retry must remain predictable
- Preserve existing retry metadata
- Preserve existing Retry-After behavior
- Do not add custom retry loops outside the existing retry flow
- Do not retry validation errors
- Do not retry non-idempotent requests unless explicitly supported by the configured behavior

### Idempotency

- Idempotency is part of integration safety
- Idempotency keys must not overwrite user-provided headers unexpectedly
- Idempotency behavior must be explicit and predictable
- Idempotency should support safe retries without changing existing retry semantics
- Do not generate idempotency keys for every request unless the feature explicitly requires it

### Hooks

- Do NOT change existing hook signatures
- New hook fields must be optional
- Preserve backward compatibility
- Hooks should receive metadata, not mutate core control flow unexpectedly
- Prefer extending hook context over introducing new hook types

### Tests

- Use Vitest
- Integration tests for request lifecycle
- Unit tests for isolated logic
- Use helpers from testUtils if they can help, especially `getFirstMockCall`
- Add regression tests for error classification
- Add tests for retry vs validation behavior
- Add tests for idempotency headers when relevant

## Code style

- Follow existing structure in `src/core`
- Do NOT introduce new layers
- Prefer extending existing flow
- Keep implementation small and explicit
- Avoid clever abstractions
- Avoid broad refactors in feature PRs

## Important

Do NOT:

- refactor request pipeline
- change retry behavior unless task explicitly requires it
- introduce new abstractions
- change public API casually
- change hook signatures
- wrap `DfsyncError` (or its subclasses) into generic `Error`
- use generic `Error` when a specific `DfsyncError` subclass should be used
- make validation retryable
- silently overwrite user headers

## When implementing features

- Keep PRs small and focused
- One concern per PR
- Preserve backward compatibility
- Add tests before or together with behavior changes
- Update README/examples when public behavior changes
- Update the root `examples/node-basic` when it becomes outdated or when new public functionality is added

## Current focus

Release: 0.9.x — Platform readiness & API stabilization

Always check the root `ROADMAP.md` before making release-related changes.
