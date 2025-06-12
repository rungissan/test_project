import { Debounced, DebounceOptions } from './debounce.types';

export function debounce<F extends (...args: unknown[]) => unknown>(
  fn: F,
  opts: DebounceOptions
): Debounced<F> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let maxTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<F> | null = null;
  let lastThis: ThisParameterType<F> | null = null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let lastInvokeTime = 0;
  let forceLeading = false;

  const { wait, leading = false, trailing = true, maxWait } = opts;

  const invoke = () => {
    const result = fn.apply(lastThis, lastArgs!) as ReturnType<F>;
    lastInvokeTime = Date.now();
    lastArgs = null;
    lastThis = null;
    return result;
  };

  const startTimers = () => {
    if (timeoutId !== null) clearTimeout(timeoutId);
    if (maxTimeoutId === null && maxWait !== undefined) {
      maxTimeoutId = setTimeout(() => {
        flush();
      }, maxWait);
    }

    timeoutId = setTimeout(() => {
      if (trailing && lastArgs) {
        flush();
      } else {
        cancel();
      }
    }, wait);
  };

  const debounced = function (this: ThisParameterType<F>, ...args: Parameters<F>): void {
    const isLeadingCall = (leading && !timeoutId) || forceLeading;

    lastArgs = args;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    lastThis = this;

    if (isLeadingCall) {
      forceLeading = false;
      invoke();
    }

    startTimers();
  };

  const flush = (): ReturnType<F> | undefined => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (maxTimeoutId) {
      clearTimeout(maxTimeoutId);
      maxTimeoutId = null;
    }

    if (lastArgs) {
      return invoke();
    }
    return undefined;
  };

  const cancel = (): void => {
    if (timeoutId) clearTimeout(timeoutId);
    if (maxTimeoutId) clearTimeout(maxTimeoutId);
    timeoutId = null;
    maxTimeoutId = null;
    lastArgs = null;
    lastThis = null;
  };

  const forceNext = (): void => {
    lastInvokeTime = 0;
    forceLeading = true;
  };

  (debounced as Debounced<F>).flush = flush;
  (debounced as Debounced<F>).cancel = cancel;
  (debounced as Debounced<F>).forceNext = forceNext;

  return debounced as Debounced<F>;
}
