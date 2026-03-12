# dfsync

[![CI](https://github.com/dfsyncjs/dfsync/actions/workflows/ci.yml/badge.svg)](https://github.com/dfsyncjs/dfsync/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)](https://github.com/dfsyncjs/dfsync/blob/main/LICENSE)

Reliable HTTP toolkit for service-to-service communication.

`dfsync` provides a set of lightweight tools for building reliable communication between backend services, microservices and integrations.

The project focuses on predictable networking behavior, consistent error handling and TypeScript-first APIs.

---

## Why dfsync?

Most HTTP clients are designed for browser or general use.

dfsync focuses specifically on **service-to-service communication** and provides predictable networking behavior for backend systems.

## Packages

| Package        | Description                                      |
| -------------- | ------------------------------------------------ |
| @dfsync/client | HTTP client for service-to-service communication |

### `@dfsync/client`

A lightweight HTTP client designed for service-to-service communication.

#### Main features:

- typed responses
- request timeout support
- automatic JSON parsing
- consistent error handling
- auth support: bearer, API key, custom
- lifecycle hooks: beforeRequest, afterResponse, onError

#### Built for modern backend systems

**dfsync** is designed for reliable HTTP communication in:

- microservices
- internal APIs
- integration services
- background workers

---

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
