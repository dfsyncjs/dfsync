import { afterEach, describe, expect, it, vi } from 'vitest';

import { createRequestController } from '../../src/core/create-request-controller';

describe('createRequestController', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('aborts the signal after the timeout', () => {
    vi.useFakeTimers();

    const controller = createRequestController({
      timeout: 100,
    });

    expect(controller.signal.aborted).toBe(false);

    vi.advanceTimersByTime(100);

    expect(controller.signal.aborted).toBe(true);

    controller.cleanup();
  });

  it('does not abort the signal after cleanup is called', () => {
    vi.useFakeTimers();

    const controller = createRequestController({
      timeout: 100,
    });

    controller.cleanup();

    vi.advanceTimersByTime(100);

    expect(controller.signal.aborted).toBe(false);
  });

  it('aborts when the external signal is aborted', () => {
    const externalController = new AbortController();

    const controller = createRequestController({
      timeout: 1000,
      signal: externalController.signal,
    });

    expect(controller.signal.aborted).toBe(false);

    externalController.abort();

    expect(controller.signal.aborted).toBe(true);

    controller.cleanup();
  });

  it('starts aborted when the external signal is already aborted', () => {
    const externalController = new AbortController();
    externalController.abort();

    const controller = createRequestController({
      timeout: 1000,
      signal: externalController.signal,
    });

    expect(controller.signal.aborted).toBe(true);

    controller.cleanup();
  });
});
