import type { HeadersMap } from './common';
import type { RequestConfig } from './request';

export type AuthContext = {
  request: RequestConfig;
  url: URL;
  headers: HeadersMap;
};

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
  apply: (ctx: AuthContext) => void | Promise<void>;
};

export type AuthConfig = BearerAuthConfig | ApiKeyAuthConfig | CustomAuthConfig;
