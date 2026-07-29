import { describe, expect, it, vi } from 'vitest';

import { createTelemetryHooks } from '../../src/core/telemetry';

describe('createTelemetryHooks', () => {
  it('maps exporter methods onto the matching hooks', () => {
    const exporter = {
      onRequestStart: vi.fn(),
      onRequestSuccess: vi.fn(),
      onRequestError: vi.fn(),
      onRequestRetry: vi.fn(),
    };

    const hooks = createTelemetryHooks(exporter);

    expect(hooks.beforeRequest).toBe(exporter.onRequestStart);
    expect(hooks.afterResponse).toBe(exporter.onRequestSuccess);
    expect(hooks.onError).toBe(exporter.onRequestError);
    expect(hooks.onRetry).toBe(exporter.onRequestRetry);
  });

  it('only wires the methods the exporter defines', () => {
    const hooks = createTelemetryHooks({
      onRequestStart: vi.fn(),
    });

    expect(hooks).toHaveProperty('beforeRequest');
    expect(hooks).not.toHaveProperty('afterResponse');
    expect(hooks).not.toHaveProperty('onError');
    expect(hooks).not.toHaveProperty('onRetry');
  });

  it('returns an empty hooks config for an empty exporter', () => {
    expect(createTelemetryHooks({})).toEqual({});
  });
});
