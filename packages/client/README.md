# @dfsync/client

[![npm version](https://img.shields.io/npm/v/@dfsync/client.svg)](https://www.npmjs.com/package/@dfsync/client)
[![npm downloads](https://img.shields.io/npm/dm/@dfsync/client.svg)](https://www.npmjs.com/package/@dfsync/client)
[![CI](https://github.com/dfsyncjs/dfsync/actions/workflows/ci.yml/badge.svg)](https://github.com/dfsyncjs/dfsync/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Reliable service-to-service HTTP communication for Node.js and TypeScript.

## Install

```bash
pnpm add dfsync
```

## Usage

```typescript
import { createClient } from "dfsync";

const client = createClient({
  baseUrl: "https://api.example.com",
  timeout: 5000,
});

const data = await client.get("/users");
```
