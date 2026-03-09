import { describe, expect, it } from 'vitest';
import { buildUrl } from '../../src/core/build-url';

describe('buildUrl', () => {
  it('joins baseUrl and path', () => {
    expect(buildUrl('https://api.test.com', '/users')).toBe('https://api.test.com/users');
  });

  it('normalizes missing slash in path', () => {
    expect(buildUrl('https://api.test.com', 'users')).toBe('https://api.test.com/users');
  });

  it('appends query params', () => {
    expect(
      buildUrl('https://api.test.com', '/users', {
        page: 1,
        active: true,
      }),
    ).toBe('https://api.test.com/users?page=1&active=true');
  });

  it('ignores null and undefined query params', () => {
    expect(
      buildUrl('https://api.test.com', '/users', {
        page: 1,
        q: undefined,
        filter: null,
      }),
    ).toBe('https://api.test.com/users?page=1');
  });
  it('removes trailing slash from baseUrl', () => {
    expect(buildUrl('https://api.test.com/', '/users')).toBe('https://api.test.com/users');
  });

  it('preserves false and 0 query values', () => {
    expect(
      buildUrl('https://api.test.com', '/users', {
        active: false,
        page: 0,
      }),
    ).toBe('https://api.test.com/users?active=false&page=0');
  });

  it('encodes query params', () => {
    expect(
      buildUrl('https://api.test.com', '/search', {
        q: 'john doe',
      }),
    ).toBe('https://api.test.com/search?q=john+doe');
  });
});
