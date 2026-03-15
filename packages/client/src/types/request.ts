import type { QueryParams, HeadersMap } from './common';
import type { RetryConfig } from './config';

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type RequestConfig = {
  method: RequestMethod;
  path: string;
  query?: QueryParams;
  body?: unknown;
  headers?: HeadersMap;
  timeout?: number;
  retry?: RetryConfig;
};

export type RequestOptions = Omit<RequestConfig, 'method' | 'path' | 'body'>;
