import type { QueryParams, HeadersMap } from './common';

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type RequestConfig = {
  method: RequestMethod;
  path: string;
  query?: QueryParams;
  body?: unknown;
  headers?: HeadersMap;
  timeout?: number;
};

export type RequestOptions = Omit<RequestConfig, 'method' | 'path' | 'body'>;
