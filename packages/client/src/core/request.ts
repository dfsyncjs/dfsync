import { HttpError } from "../errors/http-error";
import { NetworkError } from "../errors/network-error";
import { TimeoutError } from "../errors/timeout-error";
import type { HeadersMap } from "../types/common";
import type { ClientConfig } from "../types/config";
import type { RequestConfig } from "../types/request";
import { buildUrl } from "./build-url";
import { parseResponse } from "./parse-response";

const DEFAULT_TIMEOUT = 5000;

export async function request<T>(
  clientConfig: ClientConfig,
  requestConfig: RequestConfig
): Promise<T> {
  const fetchImpl = clientConfig.fetch ?? globalThis.fetch;

  if (!fetchImpl) {
    throw new Error("No fetch implementation available");
  }

  const url = buildUrl(clientConfig.baseUrl, requestConfig.path, requestConfig.query);

  const headers: HeadersMap = {
    accept: "application/json",
    ...(clientConfig.headers ?? {}),
    ...(requestConfig.headers ?? {}),
  };

  let body: BodyInit | undefined;

  if (requestConfig.body !== undefined) {
    const isStringBody = typeof requestConfig.body === "string";

    if (!isStringBody) {
      headers["content-type"] = headers["content-type"] ?? "application/json";
    }

    body = isStringBody
      ? requestConfig.body
      : JSON.stringify(requestConfig.body);
  }

  const timeout = requestConfig.timeout ?? clientConfig.timeout ?? DEFAULT_TIMEOUT;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    const response = await fetchImpl(url, {
      method: requestConfig.method,
      headers,
      body,
      signal: controller.signal,
    });

    const data = await parseResponse(response);

    if (!response.ok) {
      throw new HttpError(response, data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new TimeoutError(timeout, error);
    }

    throw new NetworkError("Network request failed", error);
  } finally {
    clearTimeout(timeoutId);
  }
}
