# dfsync — Monorepo Guidelines

This repository is a monorepo using pnpm workspaces.

## Structure

- packages/client — HTTP client for service-to-service communication
- (future packages will be added here)

## Rules

- Always detect which package you are working in
- NEVER apply changes across packages unless explicitly asked
- Keep changes scoped to a single package

## Package-specific context

When working in a package, you MUST read its local CLAUDE.md file:

- packages/client/CLAUDE.md

If a package does not have CLAUDE.md:

- follow root rules only
- do NOT invent architecture

## Development principles

- Do NOT introduce breaking changes
- Do NOT refactor unrelated code
- Prefer minimal, incremental changes
- Follow existing patterns

## When unsure

- Ask instead of guessing

## Important

When editing files inside a package, ALWAYS prefer local CLAUDE.md over this file.
