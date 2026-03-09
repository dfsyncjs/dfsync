import { describe, expect, it, vi } from 'vitest';

import { runHooks, runHooksSafely } from '../../src/core/run-hooks';

describe('runHooks', () => {
  it('does nothing when hooks are undefined', async () => {
    await expect(runHooks(undefined, { value: 1 })).resolves.toBeUndefined();
  });

  it('runs a single hook', async () => {
    const hook = vi.fn();
    const context = { value: 1 };

    await runHooks(hook, context);

    expect(hook).toHaveBeenCalledTimes(1);
    expect(hook).toHaveBeenCalledWith(context);
  });

  it('runs multiple hooks in order', async () => {
    const order: string[] = [];
    const context = { value: 1 };

    await runHooks(
      [
        () => {
          order.push('first');
        },
        () => {
          order.push('second');
        },
      ],
      context,
    );

    expect(order).toEqual(['first', 'second']);
  });

  it('runs async hooks in order', async () => {
    const order: string[] = [];
    const context = { value: 1 };

    await runHooks(
      [
        async () => {
          await Promise.resolve();
          order.push('first');
        },
        async () => {
          await Promise.resolve();
          order.push('second');
        },
      ],
      context,
    );

    expect(order).toEqual(['first', 'second']);
  });

  it('rethrows hook errors', async () => {
    await expect(
      runHooks(
        [
          () => {
            throw new Error('hook failed');
          },
        ],
        { value: 1 },
      ),
    ).rejects.toThrow('hook failed');
  });
});

describe('runHooksSafely', () => {
  it('does nothing when hooks are undefined', async () => {
    await expect(runHooksSafely(undefined, { value: 1 })).resolves.toBeUndefined();
  });

  it('runs a single hook', async () => {
    const hook = vi.fn();
    const context = { value: 1 };

    await runHooksSafely(hook, context);

    expect(hook).toHaveBeenCalledTimes(1);
    expect(hook).toHaveBeenCalledWith(context);
  });

  it('swallows hook errors', async () => {
    await expect(
      runHooksSafely(
        () => {
          throw new Error('hook failed');
        },
        { value: 1 },
      ),
    ).resolves.toBeUndefined();
  });

  it('continues running remaining hooks after an error', async () => {
    const order: string[] = [];

    await runHooksSafely(
      [
        () => {
          order.push('first');
          throw new Error('hook failed');
        },
        () => {
          order.push('second');
        },
      ],
      { value: 1 },
    );

    expect(order).toEqual(['first', 'second']);
  });

  it('continues running remaining async hooks after an error', async () => {
    const order: string[] = [];

    await runHooksSafely(
      [
        async () => {
          order.push('first');
          throw new Error('hook failed');
        },
        async () => {
          await Promise.resolve();
          order.push('second');
        },
      ],
      { value: 1 },
    );

    expect(order).toEqual(['first', 'second']);
  });
});
