import { Debounced, DebounceOptions } from './debounce.types';

export function debounce<
  F extends (...args: A) => R,
  A extends unknown[] = Parameters<F>,
  R = ReturnType<F>,
>(fn: F, opts: DebounceOptions): Debounced<F, A, R> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let maxTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: A | null = null;
  let lastThis: unknown = null;
  let forceLeading = false;

  const { wait, leading = false, trailing = true, maxWait } = opts;

  const invoke = () => {
    const result = fn.apply(lastThis, lastArgs!) as R;
    lastArgs = null;
    lastThis = null;
    return result;
  };

  const startTimers = () => {
    if (timeoutId !== null) clearTimeout(timeoutId);
    if (maxTimeoutId === null && maxWait !== undefined) {
      maxTimeoutId = setTimeout(() => {
        debounced.flush();
      }, maxWait);
    }

    timeoutId = setTimeout(() => {
      if (trailing && lastArgs) {
        debounced.flush();
      } else {
        debounced.cancel();
      }
    }, wait);
  };

  const debounced = function (this: unknown, ...args: A): R | undefined {
    const isLeadingCall = (leading && !timeoutId) || forceLeading;

    lastArgs = args;
    lastThis = this;

    if (isLeadingCall) {
      forceLeading = false;
      invoke();
    }

    startTimers();
    return undefined as R;
  };

  debounced.flush = (): R | undefined => {
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

  debounced.cancel = (): void => {
    if (timeoutId) clearTimeout(timeoutId);
    if (maxTimeoutId) clearTimeout(maxTimeoutId);
    timeoutId = null;
    maxTimeoutId = null;
    lastArgs = null;
    lastThis = null;
  };

  debounced.forceNext = (): void => {
    forceLeading = true;
  };

  return debounced as Debounced<F, A, R>;
}
