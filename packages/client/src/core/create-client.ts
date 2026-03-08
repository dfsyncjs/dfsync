import type { Client } from "../types/client";
import type { ClientConfig } from "../types/config";
import type { RequestConfig, RequestOptions } from "../types/request";
import { request } from "./request";

export function createClient(config: ClientConfig): Client {
  return {
    get<T = unknown>(path: string, options?: RequestOptions): Promise<T> {
      return request<T>(config, {
        ...options,
        method: "GET",
        path,
      });
    },

    post<T = unknown>(
      path: string,
      body?: unknown,
      options?: RequestOptions
    ): Promise<T> {
      return request<T>(config, {
        ...options,
        method: "POST",
        path,
        body,
      });
    },

    put<T = unknown>(
      path: string,
      body?: unknown,
      options?: RequestOptions
    ): Promise<T> {
      return request<T>(config, {
        ...options,
        method: "PUT",
        path,
        body,
      });
    },

    delete<T = unknown>(path: string, options?: RequestOptions): Promise<T> {
      return request<T>(config, {
        ...options,
        method: "DELETE",
        path,
      });
    },

    request<T = unknown>(requestConfig: RequestConfig): Promise<T> {
      return request<T>(config, requestConfig);
    },
  };
}
