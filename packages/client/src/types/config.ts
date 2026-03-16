import type { HeadersMap } from './common';
import type { AuthConfig } from './auth';
import type { HooksConfig } from './hooks';
import type { RequestMethod } from './request';

export type RetryCondition = 'network-error' | '5xx' | '429';
export type RetryBackoff = 'fixed' | 'exponential';

export type RetryConfig = {
  attempts?: number;
  backoff?: RetryBackoff;
  baseDelayMs?: number;
  retryOn?: RetryCondition[];
  retryMethods?: RequestMethod[];
};

export type ClientConfig = {
  baseUrl: string;
  timeout?: number;
  headers?: HeadersMap;
  auth?: AuthConfig;
  hooks?: HooksConfig;
  retry?: RetryConfig;
  fetch?: typeof globalThis.fetch;
};
