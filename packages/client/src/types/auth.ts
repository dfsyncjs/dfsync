import type { HeadersMap } from './common';
import type { RequestConfig } from './request';

export type AuthContext = {
  request: RequestConfig;
  url: URL;
  headers: HeadersMap;
};

/**
 * Stable auth provider interface. An auth provider applies authentication to a
 * request by mutating its headers or URL through the provided `AuthContext`.
 * This is the contract behind `{ type: 'custom' }` auth.
 */
export type AuthProvider = (ctx: AuthContext) => void | Promise<void>;

export type AuthValueResolver = string | (() => string | Promise<string>);

export type BearerAuthConfig = {
  type: 'bearer';
  token: AuthValueResolver;
  headerName?: string;
};

export type ApiKeyAuthConfig = {
  type: 'apiKey';
  value: AuthValueResolver;
  in?: 'header' | 'query';
  name?: string;
};

export type CustomAuthConfig = {
  type: 'custom';
  apply: AuthProvider;
};

export type AuthConfig = BearerAuthConfig | ApiKeyAuthConfig | CustomAuthConfig;
