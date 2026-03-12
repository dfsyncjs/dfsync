# dfsync

Reliable HTTP communication toolkit for service-to-service communication.

`dfsync` provides a set of lightweight tools for building reliable communication between backend services, microservices and integrations.

The project focuses on predictable networking behavior, consistent error handling and TypeScript-first APIs.

---

## Requirements:

- Node >= 20
- pnpm >= 10

Setup:

```bash
corepack enable
pnpm install
```

## Packages

### `@dfsync/client`

A lightweight HTTP client designed for service-to-service communication.

Main features:

- typed responses
- request timeout support
- automatic JSON parsing
- consistent error handling
- auth support: bearer, API key, custom
- lifecycle hooks: beforeRequest, afterResponse, onError

Install:

```bash
npm install @dfsync/client
```

Example:

```typescript
import { createClient } from '@dfsync/client';

const client = createClient({
  baseUrl: 'https://api.example.com',
  timeout: 5000,
});

const users = await client.get('/users');
```

NPM:
[https://www.npmjs.com/package/@dfsync/client](https://www.npmjs.com/package/@dfsync/client)

Home page:
[https://dfsyncjs.github.io](https://dfsyncjs.github.io)

## Project Structure

This repository uses a **pnpm monorepo**.

```
packages/
  client/        main dfsync HTTP client package

examples/
  node-basic/    basic usage example

smoke/
  */             smoke tests verifying published packages
```
