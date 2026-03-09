import { expect, vi } from 'vitest';

export function getFirstMockCall<T extends (...args: any[]) => any>(
  mockFn: ReturnType<typeof vi.fn>,
) {
  const firstCall = mockFn.mock.calls[0];
  expect(firstCall).toBeDefined();
  return firstCall!;
}
