export interface DebounceOptions {
  wait: number;
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export interface Debounced<F extends (...args: unknown[]) => unknown> {
  (...args: Parameters<F>): ReturnType<F> | void;
  cancel(): void;
  flush(): ReturnType<F> | undefined;
  forceNext(): void;
}
