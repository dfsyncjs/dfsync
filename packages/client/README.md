# @dfsync/client

[![npm version](https://img.shields.io/npm/v/@dfsync/client.svg)](https://www.npmjs.com/package/@dfsync/client)
![TypeScript](https://img.shields.io/badge/TypeScript-ready-blue)
[![npm downloads](https://img.shields.io/npm/dm/@dfsync/client.svg)](https://www.npmjs.com/package/@dfsync/client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/dfsyncjs/dfsync/blob/main/LICENSE)

Reliable service-to-service HTTP communication for Node.js and TypeScript.

Designed for backend services, microservices and internal APIs where consistent and reliable HTTP communication between services is required.

Home page:
[https://dfsyncjs.github.io](https://dfsyncjs.github.io)

## Features

- lightweight HTTP client for backend services
- typed responses
- request timeout support
- automatic JSON parsing
- consistent error handling
- auth support: bearer, API key, custom
- lifecycle hooks: beforeRequest, afterResponse, onError
- minimal dependencies

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

## Auth

### Bearer token

```typescript
const client = createClient({
  baseUrl: 'https://api.example.com',
  auth: {
    type: 'bearer',
    token: process.env.API_TOKEN!,
  },
});
```

### Async bearer token

```typescript
const client = createClient({
  baseUrl: 'https://api.example.com',
  auth: {
    type: 'bearer',
    token: async () => {
      return process.env.API_TOKEN!;
    },
  },
});
```

### API key in header

```typescript
const client = createClient({
  baseUrl: 'https://api.example.com',
  auth: {
    type: 'apiKey',
    value: process.env.API_KEY!,
  },
});
```

### API key in query

```typescript
const client = createClient({
  baseUrl: 'https://api.example.com',
  auth: {
    type: 'apiKey',
    value: process.env.API_KEY!,
    in: 'query',
    name: 'api_key',
  },
});
```

### Custom auth

```typescript
const client = createClient({
  baseUrl: 'https://api.example.com',
  auth: {
    type: 'custom',
    apply: ({ headers, url }) => {
      headers['x-service-name'] = 'billing-worker';
      url.searchParams.set('tenant', 'acme');
    },
  },
});
```

## Hooks

### beforeRequest

```typescript
const client = createClient({
  baseUrl: 'https://api.example.com',
  hooks: {
    beforeRequest: ({ headers }) => {
      headers['x-request-id'] = crypto.randomUUID();
    },
  },
});
```

### afterResponse

```typescript
const client = createClient({
  baseUrl: 'https://api.example.com',
  hooks: {
    afterResponse: ({ response, data }) => {
      console.log('status:', response.status);
      console.log('data:', data);
    },
  },
});
```

### onError

```typescript
const client = createClient({
  baseUrl: 'https://api.example.com',
  hooks: {
    onError: ({ error }) => {
      console.error('request failed:', error);
    },
  },
});
```

### Multiple hooks

```typescript
const client = createClient({
  baseUrl: 'https://api.example.com',
  hooks: {
    beforeRequest: [
      ({ headers }) => {
        headers['x-service-name'] = 'gateway';
      },
      ({ headers }) => {
        headers['x-request-id'] = crypto.randomUUID();
      },
    ],
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

## Roadmap

The goal of dfsync is to become a reliable toolkit for service-to-service communication.

Planned next steps:

- Retry policies
- Tracing support
- Extended hooks and observability features
