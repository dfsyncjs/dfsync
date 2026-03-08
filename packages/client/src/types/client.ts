import type { RequestConfig, RequestOptions } from "./request";

export type Client = {
  get<T = unknown>(path: string, options?: RequestOptions): Promise<T>;
  post<T = unknown>(
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T>;
  put<T = unknown>(
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T>;
  delete<T = unknown>(path: string, options?: RequestOptions): Promise<T>;
  request<T = unknown>(config: RequestConfig): Promise<T>;
};
