import type { AuthConfig, AuthValueResolver } from '../types/auth';
import type { HeadersMap } from '../types/common';
import type { RequestConfig } from '../types/request';

type ApplyAuthParams = {
  auth: AuthConfig | undefined;
  request: RequestConfig;
  url: URL;
  headers: HeadersMap;
};

async function resolveValue(resolver: AuthValueResolver): Promise<string> {
  return typeof resolver === 'function' ? await resolver() : resolver;
}

export async function applyAuth({ auth, request, url, headers }: ApplyAuthParams): Promise<void> {
  if (!auth) {
    return;
  }

  switch (auth.type) {
    case 'bearer': {
      const token = await resolveValue(auth.token);
      const headerName = auth.headerName ?? 'authorization';
      headers[headerName] = `Bearer ${token}`;
      return;
    }

    case 'apiKey': {
      const value = await resolveValue(auth.value);
      const target = auth.in ?? 'header';
      const name = auth.name ?? 'x-api-key';

      if (target === 'query') {
        url.searchParams.set(name, value);
        return;
      }

      headers[name] = value;
      return;
    }

    case 'custom': {
      await auth.apply({ request, url, headers });
      return;
    }

    default: {
      const exhaustiveCheck: never = auth;
      return exhaustiveCheck;
    }
  }
}
