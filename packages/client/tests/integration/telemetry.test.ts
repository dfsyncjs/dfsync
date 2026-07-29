import { describe, expect, it, vi } from 'vitest';

import { createClient, createTelemetryHooks } from '../../src';
import type { TelemetryExporter } from '../../src';
import { getFirstMockCall } from '../testUtils';

describe('telemetry exporter integration', () => {
  it('reports start and success through a telemetry exporter', async () => {
    const exporter: TelemetryExporter = {
      onRequestStart: vi.fn(),
      onRequestSuccess: vi.fn(),
      onRequestError: vi.fn(),
    };

    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      hooks: createTelemetryHooks(exporter),
    });

    await client.get('/users', { operationName: 'listUsers' });

    expect(exporter.onRequestStart).toHaveBeenCalledTimes(1);
    expect(exporter.onRequestSuccess).toHaveBeenCalledTimes(1);
    expect(exporter.onRequestError).not.toHaveBeenCalled();

    expect(getFirstMockCall(exporter.onRequestStart as ReturnType<typeof vi.fn>)[0]).toEqual(
      expect.objectContaining({ operationName: 'listUsers' }),
    );
  });

  it('reports errors through a telemetry exporter', async () => {
    const exporter: TelemetryExporter = {
      onRequestError: vi.fn(),
    };

    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ message: 'Not found' }), {
        status: 404,
        statusText: 'Not Found',
        headers: { 'content-type': 'application/json' },
      }),
    );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      hooks: createTelemetryHooks(exporter),
    });

    await expect(client.get('/users/999')).rejects.toBeTruthy();

    expect(exporter.onRequestError).toHaveBeenCalledTimes(1);
  });

  it('reports retries through a telemetry exporter', async () => {
    const exporter: TelemetryExporter = {
      onRequestRetry: vi.fn(),
      onRequestSuccess: vi.fn(),
    };

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Service Unavailable' }), {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'content-type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      );

    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      retry: { attempts: 1, baseDelayMs: 0, retryOn: ['5xx'], retryMethods: ['GET'] },
      hooks: createTelemetryHooks(exporter),
    });

    await client.get('/users');

    expect(exporter.onRequestRetry).toHaveBeenCalledTimes(1);
    expect(exporter.onRequestSuccess).toHaveBeenCalledTimes(1);
  });
});
