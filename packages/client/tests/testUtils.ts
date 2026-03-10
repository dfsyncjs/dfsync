import { expect } from 'vitest';
import type { Mock } from 'vitest';

export function getFirstMockCall<TArgs extends unknown[]>(
  mockFn: Mock<(...args: TArgs) => unknown>,
): TArgs {
  const firstCall = mockFn.mock.calls[0];

  expect(firstCall).toBeDefined();

  if (!firstCall) {
    throw new Error('Expected mock to have been called at least once');
  }

  return firstCall;
}
