import type { QueryParams } from "../types/common";

export function buildUrl(baseUrl: string, path: string, query?: QueryParams): string {
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const url = new URL(`${normalizedBaseUrl}${normalizedPath}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === null || value === undefined) {
        continue;
      }

      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}
