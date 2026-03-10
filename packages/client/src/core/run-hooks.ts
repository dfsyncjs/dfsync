type MaybeArray<T> = T | T[] | undefined;

export async function runHooks<TContext>(
  hooks: MaybeArray<(ctx: TContext) => void | Promise<void>>,
  context: TContext,
): Promise<void> {
  if (!hooks) {
    return;
  }

  const list = Array.isArray(hooks) ? hooks : [hooks];

  for (const hook of list) {
    await hook(context);
  }
}

export async function runHooksSafely<TContext>(
  hooks: MaybeArray<(ctx: TContext) => void | Promise<void>>,
  context: TContext,
): Promise<void> {
  if (!hooks) {
    return;
  }

  const list = Array.isArray(hooks) ? hooks : [hooks];

  for (const hook of list) {
    try {
      await hook(context);
    } catch {
      // Intentionally swallow hook errors so they never replace
      // the original request error.
    }
  }
}
