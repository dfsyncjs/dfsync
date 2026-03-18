export type RequestController = {
  signal: AbortSignal;
  cleanup: () => void;
};

type CreateRequestControllerParams = {
  timeout: number;
  signal?: AbortSignal | undefined;
};

export function createRequestController(params: CreateRequestControllerParams): RequestController {
  const timeoutController = new AbortController();

  const timeoutId = setTimeout(() => {
    timeoutController.abort();
  }, params.timeout);

  if (!params.signal) {
    return {
      signal: timeoutController.signal,
      cleanup: () => {
        clearTimeout(timeoutId);
      },
    };
  }

  if (params.signal.aborted) {
    timeoutController.abort();
  }

  const abortOnExternalSignal = () => {
    timeoutController.abort();
  };

  params.signal.addEventListener('abort', abortOnExternalSignal, { once: true });

  return {
    signal: timeoutController.signal,
    cleanup: () => {
      clearTimeout(timeoutId);
      params.signal?.removeEventListener('abort', abortOnExternalSignal);
    },
  };
}
