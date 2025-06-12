export interface DebounceOptions {
  wait: number;
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export type Debounced<
  F extends (...args: A) => R,
  A extends unknown[] = Parameters<F>,
  R = ReturnType<F>,
> = {
  (...args: A): R;
  cancel(): void;
  flush(): ReturnType<F> | undefined;
  forceNext: () => void;
};
