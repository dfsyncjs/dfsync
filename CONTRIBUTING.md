# Contributing to dfsync

Thank you for your interest in contributing to **dfsync**.

dfsync is an open-source TypeScript library focused on **reliable HTTP communication between services**.
We welcome contributions that improve stability, developer experience, documentation, and examples.

---

# Ways to Contribute

You can contribute by:

- fixing bugs
- improving documentation
- adding examples
- improving test coverage
- suggesting new features
- improving developer experience

Small and focused pull requests are preferred.

---

# Before You Start

Before opening a pull request:

1. Check existing **issues** and **pull requests**
2. For larger changes, consider opening an **issue** first
3. For small fixes (docs, typos, tests), feel free to open a PR directly

---

# Project Structure

This repository uses a **pnpm monorepo**.

```
packages/
  client/        main dfsync HTTP client package

examples/
  node-basic/    basic usage example

smoke/
  */             smoke tests verifying published packages
```

The main library lives in:

```
packages/client
```

---

# Local Development

Clone the repository:

```bash
git clone https://github.com/dfsyncjs/dfsync.git
cd dfsync
```

Install dependencies:

```bash
pnpm install
```

Build the project:

```bash
pnpm build
```

Run tests:

```bash
pnpm test
```

Run lint:

```bash
pnpm lint
```

Type checking:

```bash
pnpm typecheck
```

---

# Coding Guidelines

Please follow these principles:

- Use **TypeScript**
- Keep the public API **minimal and predictable**
- Prefer **small focused changes**
- Avoid breaking public APIs without discussion
- Keep code readable and maintainable

---

# Tests

If your change affects behavior:

- add or update tests
- ensure **all tests pass**

Tests are run using **Vitest**.

Run locally:

```bash
pnpm test
```

---

# Documentation

If your change affects the public API, please update:

- README
- documentation
- examples (if necessary)

Examples should remain **simple and runnable**.

---

# Changesets and Releases

This project uses **changesets** for release management.

If your change affects the published package:

```bash
pnpm changeset
```

Examples when a changeset is required:

- new features
- bug fixes
- API changes

Documentation-only changes usually **do not require a changeset**.

---

# Pull Requests

When submitting a PR:

- create a branch from `main`
- keep PRs small and focused
- provide a clear description of the change
- explain **why the change is needed**

Before submitting, ensure the following commands succeed:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

---

# Thank You

Your contributions help make **dfsync** better for everyone.
