# @dfsync/client

[![npm version](https://img.shields.io/npm/v/@dfsync/client.svg)](https://www.npmjs.com/package/@dfsync/client)
[![npm downloads](https://img.shields.io/npm/dm/@dfsync/client.svg)](https://www.npmjs.com/package/@dfsync/client)
[![CI](https://github.com/dfsyncjs/dfsync/actions/workflows/ci.yml/badge.svg)](https://github.com/dfsyncjs/dfsync/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Reliable service-to-service HTTP communication for Node.js and TypeScript.

Designed for backend services, microservices and internal APIs where consistent and reliable HTTP communication between services is required.

Home page:
[https://dfsyncjs.github.io](https://dfsyncjs.github.io)

## Install

```bash
npm install @dfsync/client
```

## Quick Start

```typescript
import { createClient } from '@dfsync/client';

const client = createClient({
  baseUrl: 'https://api.example.com',
  timeout: 5000,
});

const users = await client.get('/users');
```

## Usage

### Create a client

```typescript
import { createClient } from '@dfsync/client';

const client = createClient({
  baseUrl: 'https://api.example.com',
  timeout: 5000,
});
```

Optional configuration:

```typescript
const client = createClient({
  baseUrl: 'https://api.example.com',
  timeout: 5000,
  headers: {
    Authorization: 'Bearer token',
  },
});
```

### GET request

```typescript
const users = await client.get('/users');
```

### POST request

```typescript
const user = await client.post('/users', {
  name: 'John',
  email: 'john@example.com',
});
```

### Query parameters

```typescript
const users = await client.get('/users', {
  query: {
    page: 1,
    limit: 20,
  },
});
```

## Error Handling

Requests may throw structured errors depending on the failure type.

Example:

```typescript
try {
  const users = await client.get('/users');
  return users;
} catch (error) {
  if (error instanceof HttpError) {
    if (error.status === 401) {
      throw new Error('Unauthorized');
    }

    if (error.status === 404) {
      return [];
    }
  }

  // Handling timeout errors
  if (error instanceof TimeoutError) {
    console.error('Service timeout');
  }

  // Handling network errors
  if (error instanceof NetworkError) {
    console.error('Network failure');
  }

  throw error;
}
```

Typical error categories:

- HTTP errors – non-2xx responses from the server
- Network errors – connection issues
- Timeout errors – request exceeded configured timeout

This makes it easier to handle failures in service-to-service communication.

## Features

- lightweight HTTP client for backend services
- built for Node.js and TypeScript
- service-to-service API communication
- typed responses
- request timeouts
- automatic JSON parsing
- consistent error handling
- minimal dependencies

## Future

The goal of dfsync is to become a reliable toolkit for service-to-service communication.

Planned features include:

- automatic retries
- request hooks / middleware
- tracing support
- metrics and observability
- circuit breaker support
- advanced error handling strategies
- service communication patterns for microservices
