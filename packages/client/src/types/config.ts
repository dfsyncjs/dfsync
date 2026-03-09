import type { HeadersMap } from './common';
import type { AuthConfig } from './auth';
import type { HooksConfig } from './hooks';

export type ClientConfig = {
  baseUrl: string;
  timeout?: number;
  headers?: HeadersMap;
  fetch?: typeof globalThis.fetch;
  auth?: AuthConfig;
  hooks?: HooksConfig;
};
