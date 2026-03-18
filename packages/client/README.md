# @dfsync/client

A lightweight and reliable HTTP client for service-to-service communication in Node.js, with built-in retry, authentication, and lifecycle hooks.

Designed for backend services, microservices and internal APIs where consistent and reliable HTTP communication between services is required.

[![npm version](https://img.shields.io/npm/v/@dfsync/client.svg)](https://www.npmjs.com/package/@dfsync/client)
[![npm downloads](https://img.shields.io/npm/dw/@dfsync/client.svg)](https://www.npmjs.com/package/@dfsync/client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Home page: [https://dfsyncjs.github.io](https://dfsyncjs.github.io)

Full documentation: [https://dfsyncjs.github.io/#/docs](https://dfsyncjs.github.io/#/docs)

## Install

```bash
npm install @dfsync/client
```

## Quick Start

```ts
import { createClient } from '@dfsync/client';

const client = createClient({
  baseUrl: 'https://api.example.com',
  retry: { attempts: 3 },
});

const users = await client.get('/users');

const createdUser = await client.post('/users', {
  name: 'John',
});

const updatedUser = await client.patch('/users/1', {
  name: 'Jane',
});
```

## HTTP methods

`@dfsync/client` provides a small and predictable method surface:

```text
client.get(path, options?)
client.delete(path, options?)

client.post(path, body?, options?)
client.put(path, body?, options?)
client.patch(path, body?, options?)

client.request(config)
```

`get` and `delete` do not accept `body` in options.

`post`, `put`, and `patch` accept request body as a separate second argument.

## Main features

- typed responses
- request timeout support
- automatic JSON parsing
- consistent error handling
- auth support: bearer, API key, custom
- lifecycle hooks: `beforeRequest`, `afterResponse`, `onError`
- support for `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`
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

See the project roadmap:  
https://github.com/dfsyncjs/dfsync/blob/main/ROADMAP.md
