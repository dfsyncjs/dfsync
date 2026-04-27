# @dfsync/client — Development Context

This package provides a reliable HTTP client for service-to-service communication.

## Scope

- Node.js / TypeScript HTTP client
- Focus on predictable request lifecycle
- Used in microservices and integrations

## Architecture

Core flow:

1. createExecutionContext
2. applyRequestMetadata (headers, requestId)
3. fetch
4. parseResponse
5. error handling (HttpError / NetworkError / etc.)
6. response validation (if configured)
7. hooks execution

## Key principles

### Error handling

- All internal errors must extend `DfsyncError`
- NEVER wrap `DfsyncError` into `NetworkError`
- Preserve original error types

### Validation

- Runs only after successful HTTP responses
- Throws `ValidationError`
- MUST NOT trigger retries

### Retry

- Applies only to:
  - network errors
  - 5xx responses
  - 429 responses
- Must remain predictable

### Hooks

- Do NOT change existing hook signatures
- New fields must be optional

### Tests

- Integration tests for request lifecycle
- Unit tests for isolated logic
- Use `getFirstMockCall` from testUtils

## Code style

- Follow existing structure in src/core
- Do NOT introduce new layers
- Prefer extending existing flow

## Important

Do NOT:

- refactor request pipeline
- change retry behavior unless task explicitly requires it
- introduce new abstractions

## When implementing features

- Keep PRs small and focused
- One concern per PR

## Current focus

Release: 0.8.x — Integration safety

Areas:

- response validation
- idempotency
- safe retries
