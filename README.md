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

Features:

- typed responses
- request timeouts
- consistent error handling
- automatic JSON parsing
- designed for Node.js services

Install:

```bash
pnpm add @dfsync/client
```

or

```bash
npm install @dfsync/client
```

Example:

```typescript
import { createClient } from "@dfsync/client";

const client = createClient({
  baseUrl: "https://api.example.com",
  timeout: 5000,
});

const users = await client.get("/users");
```

Full documentation:
[https://www.npmjs.com/package/@dfsync/client](https://www.npmjs.com/package/@dfsync/client)

## Project Structure

```bash
packages/
  client/      HTTP client implementation
```

## Development

Install dependencies:

```bash
pnpm install
```

Run tests:

```bash
pnpm test
```

Build packages:

```bash
pnpm build
```
