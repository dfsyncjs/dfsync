export function parseRetryAfter(value: string | null | undefined): number | undefined {
  if (value == null) {
    return undefined;
  }

  const normalized = value.trim();

  if (normalized.length === 0) {
    return undefined;
  }

  if (/^\d+$/.test(normalized)) {
    const seconds = Number(normalized);

    if (!Number.isFinite(seconds) || seconds < 0) {
      return undefined;
    }

    return seconds * 1000;
  }

  const timestamp = Date.parse(normalized);

  if (Number.isNaN(timestamp)) {
    return undefined;
  }

  const delayMs = timestamp - Date.now();

  if (delayMs < 0) {
    return 0;
  }

  return delayMs;
}
