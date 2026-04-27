# dfsync

[![CI](https://github.com/dfsyncjs/dfsync/actions/workflows/ci.yml/badge.svg)](https://github.com/dfsyncjs/dfsync/actions/workflows/ci.yml)
[![github stars](https://img.shields.io/github/stars/dfsyncjs/dfsync)](https://github.com/dfsyncjs/dfsync)
[![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)](https://github.com/dfsyncjs/dfsync/blob/main/LICENSE)

Open-source toolkit for reliable service-to-service communication.

`dfsync` provides a set of lightweight tools for building reliable communication between backend services, microservices and integrations.

The project focuses on predictable networking behavior, consistent error handling and TypeScript-first APIs.

---

## Why dfsync?

Most clients are designed for browser or general use.

dfsync focuses specifically on **service-to-service communication** and provides predictable networking behavior for backend systems.

## Packages

| Package        | Description                                      |
| -------------- | ------------------------------------------------ |
| @dfsync/client | HTTP client for service-to-service communication |

### `@dfsync/client`

A lightweight HTTP client designed for service-to-service communication.

[![npm version](https://img.shields.io/npm/v/@dfsync/client.svg)](https://www.npmjs.com/package/@dfsync/client)
[![npm downloads](https://img.shields.io/npm/dw/@dfsync/client.svg)](https://www.npmjs.com/package/@dfsync/client)

NPM:
[https://www.npmjs.com/package/@dfsync/client](https://www.npmjs.com/package/@dfsync/client)

Home page:
[https://dfsyncjs.github.io](https://dfsyncjs.github.io)

Full documentation:
[https://dfsyncjs.github.io/#/docs](https://dfsyncjs.github.io/#/docs)

#### Main features

- predictable request lifecycle
- request ID propagation (`x-request-id`)
- request cancellation via `AbortSignal`
- built-in retry with configurable policies
- lifecycle hooks: `beforeRequest`, `afterResponse`, `onError`
- request timeout support

- typed responses
- automatic JSON parsing
- consistent error handling

- auth support: bearer, API key, custom
- support for `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`
- response validation
- idempotency key support for safer retries

**@dfsync/client** provides a predictable and controllable HTTP request lifecycle for service-to-service communication.

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
  baseURL: 'https://api.example.com',
  retry: { attempts: 3 },
});

const users = await client.get('/users', {
  requestId: 'req_123',
});
```

## Project Structure

This repository uses a **pnpm monorepo**.

Setup:

```bash
corepack enable
pnpm install
```

```
packages/
  client/        main dfsync HTTP client package

examples/
  node-basic/    basic usage example

smoke/
  */             smoke tests verifying published packages
```

## Roadmap

See the [project roadmap](https://github.com/dfsyncjs/dfsync/blob/main/ROADMAP.md)
