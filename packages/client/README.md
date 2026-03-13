# @dfsync/client

Reliable service-to-service HTTP communication for Node.js and TypeScript.

Designed for backend services, microservices and internal APIs where consistent and reliable HTTP communication between services is required.

[![npm version](https://img.shields.io/npm/v/@dfsync/client.svg)](https://www.npmjs.com/package/@dfsync/client)
[![npm downloads](https://img.shields.io/npm/dw/@dfsync/client.svg)](https://www.npmjs.com/package/@dfsync/client)
[![github stars](https://img.shields.io/github/stars/dfsyncjs/dfsync)](https://github.com/dfsyncjs/dfsync)
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

```typescript
import { createClient } from '@dfsync/client';

const client = createClient({
  baseUrl: 'https://api.example.com',
  timeout: 5000,
  auth: {
    type: 'bearer',
    token: process.env.API_TOKEN!,
  },
  hooks: {
    afterResponse: ({ response, data }) => {
      console.log('status:', response.status);
      console.log('data:', data);
    },
  },
});

const users = await client.get('/users');
```

## Features

- typed responses
- request timeout support
- automatic JSON parsing
- consistent error handling
- auth support: bearer, API key, custom
- lifecycle hooks: beforeRequest, afterResponse, onError

## Roadmap

The goal of dfsync is to become a reliable toolkit for service-to-service communication.

Planned next steps:

- Retry policies
- Tracing support
- Extended hooks and observability features
