# dfsync

Reliable service-to-service HTTP communication toolkit for Node.js and TypeScript.

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
