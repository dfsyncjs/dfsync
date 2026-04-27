import type { HeadersMap, QueryParams } from './common';
import type { RetryConfig, ResponseValidator } from './config';

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type RequestConfig = {
  method: RequestMethod;
  path: string;
  query?: QueryParams;
  body?: unknown;
  headers?: HeadersMap;
  timeout?: number;
  retry?: RetryConfig;
  signal?: AbortSignal;
  requestId?: string;
  validateResponse?: ResponseValidator;
};

export type RequestOptionsWithoutBody = Omit<RequestConfig, 'method' | 'path' | 'body'>;

export type RequestOptions = RequestOptionsWithoutBody;
