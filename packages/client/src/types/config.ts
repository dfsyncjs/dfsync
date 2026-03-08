import type { HeadersMap } from './common';

export type ClientConfig = {
  baseUrl: string;
  timeout?: number;
  headers?: HeadersMap;
  fetch?: typeof globalThis.fetch;
};
