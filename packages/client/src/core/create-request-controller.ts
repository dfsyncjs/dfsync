export type RequestController = {
  signal: AbortSignal;
  cleanup: () => void;
};

export function createRequestController(timeout: number): RequestController {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timeoutId);
    },
  };
}
