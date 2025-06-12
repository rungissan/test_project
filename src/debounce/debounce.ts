import { Debounced, DebounceOptions } from './debounce.types';

export function debounce<F extends (...args: unknown[]) => unknown>(
  fn: F,
  opts: DebounceOptions
): Debounced<F> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastCallTime = 0;
  let lastArgs: Parameters<F> | null = null;
  let lastThis: ThisParameterType<F> | null = null;

  const wait = opts.wait;

  const debounced = function (
    this: ThisParameterType<F>,
    ...args: Parameters<F>
  ): ReturnType<F> | void {
    const now = Date.now();

    lastArgs = args;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    lastThis = this;

    const shouldCallNow = now >= lastCallTime + wait;

    if (shouldCallNow) {
      lastCallTime = now;
      return fn.apply(this, args) as ReturnType<F>;
    }

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      if (lastArgs && lastThis) {
        lastCallTime = Date.now();
        fn.apply(lastThis, lastArgs);
        lastArgs = null;
        lastThis = null;
      }
    }, wait);
  };

  debounced.cancel = (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
    lastThis = null;
  };

  debounced.flush = function (): ReturnType<F> | undefined {
    if (timeoutId && lastArgs && lastThis) {
      clearTimeout(timeoutId);
      timeoutId = null;
      const result = fn.apply(lastThis, lastArgs) as ReturnType<F>;
      lastArgs = null;
      lastThis = null;
      return result;
    }
    return undefined;
  };

  debounced.forceNext = (): void => {
    lastCallTime = 0;
  };

  return debounced as Debounced<F>;
}
