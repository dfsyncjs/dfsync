export type RequestAbortReason = 'timeout' | 'external';

export type RequestController = {
  signal: AbortSignal;
  cleanup: () => void;
  getAbortReason: () => RequestAbortReason | undefined;
};

type CreateRequestControllerParams = {
  timeout: number;
  signal?: AbortSignal | undefined;
};

export function createRequestController(params: CreateRequestControllerParams): RequestController {
  const timeoutController = new AbortController();

  let abortReason: RequestAbortReason | undefined;

  const timeoutId = setTimeout(() => {
    abortReason = 'timeout';
    timeoutController.abort();
  }, params.timeout);

  if (!params.signal) {
    return {
      signal: timeoutController.signal,
      cleanup: () => {
        clearTimeout(timeoutId);
      },
      getAbortReason: () => abortReason,
    };
  }

  if (params.signal.aborted) {
    abortReason = 'external';
    timeoutController.abort();
  }

  const abortOnExternalSignal = () => {
    abortReason = 'external';
    timeoutController.abort();
  };

  params.signal.addEventListener('abort', abortOnExternalSignal, { once: true });

  return {
    signal: timeoutController.signal,
    cleanup: () => {
      clearTimeout(timeoutId);
      params.signal?.removeEventListener('abort', abortOnExternalSignal);
    },
    getAbortReason: () => abortReason,
  };
}
