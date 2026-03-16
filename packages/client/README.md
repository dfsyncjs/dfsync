# @dfsync/client

A lightweight and reliable HTTP client for service-to-service communication in Node.js, with built-in retry, authentication, and lifecycle hooks.

Designed for backend services, microservices and internal APIs where consistent and reliable HTTP communication between services is required.

[![npm version](https://img.shields.io/npm/v/@dfsync/client.svg)](https://www.npmjs.com/package/@dfsync/client)
[![npm downloads](https://img.shields.io/npm/dm/@dfsync/client.svg)](https://www.npmjs.com/package/@dfsync/client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Home page:
[https://dfsyncjs.github.io](https://dfsyncjs.github.io)

Full documentation:
[https://dfsyncjs.github.io/#/docs](https://dfsyncjs.github.io/#/docs)

## Install

```bash
npm install @dfsync/client
```

## Quick Start

```ts
import { createClient } from '@dfsync/client';

const client = createClient({
  baseUrl: 'https://api.example.com',
  timeout: 5000,
});

const users = await client.get('/users');
```

## Features

- typed responses
- request timeout support
- automatic JSON parsing
- consistent error handling
- auth support: bearer, API key, custom
- lifecycle hooks: `beforeRequest`, `afterResponse`, `onError`
- retry policies

## How requests work

A request in `@dfsync/client` follows this flow:

1. build final URL from `baseUrl`, `path`, and optional query params
2. merge default, client-level, and request-level headers
3. apply auth configuration
4. run `beforeRequest` hooks
5. send request with `fetch`
6. if the request fails with a retryable error, retry according to the configured retry policy
7. parse response as JSON, text, or `undefined` for `204`
8. throw structured errors for failed requests
9. run `afterResponse` or `onError` hooks

## Roadmap

The goal of dfsync is to become a reliable toolkit for service-to-service communication.

Planned next steps:

- Tracing support
- Extended hooks and observability features
