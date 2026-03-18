import type { RequestOptionsWithoutBody, RequestConfig } from './request';

export type Client = {
  get<T = unknown>(path: string, options?: RequestOptionsWithoutBody): Promise<T>;

  delete<T = unknown>(path: string, options?: RequestOptionsWithoutBody): Promise<T>;

  post<T = unknown>(path: string, body?: unknown, options?: RequestOptionsWithoutBody): Promise<T>;

  put<T = unknown>(path: string, body?: unknown, options?: RequestOptionsWithoutBody): Promise<T>;

  patch<T = unknown>(path: string, body?: unknown, options?: RequestOptionsWithoutBody): Promise<T>;

  request<T = unknown>(config: RequestConfig): Promise<T>;
};
