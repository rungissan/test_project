import { debounce } from '@/debounce';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should call function after wait (trailing by default)', async () => {
    const fn = vi.fn();
    const debounced = debounce(fn, { wait: 100 });

    debounced();
    vi.advanceTimersByTime(99);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    await Promise.resolve();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should call function immediately with leading: true', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, { wait: 100, leading: true, trailing: false });

    debounced();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should not call again during wait if leading is true and trailing is false', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, { wait: 100, leading: true, trailing: false });

    debounced();
    debounced();
    vi.advanceTimersByTime(50);
    debounced();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should call again after wait if trailing is true and multiple calls made', async () => {
    const fn = vi.fn();
    const debounced = debounce(fn, { wait: 100 });

    debounced();
    vi.advanceTimersByTime(50);
    debounced();
    vi.advanceTimersByTime(100);
    await Promise.resolve();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should flush pending call', async () => {
    const fn = vi.fn();
    const debounced = debounce(fn, { wait: 100 });

    debounced();
    vi.advanceTimersByTime(50);
    debounced.flush();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should cancel pending calls', async () => {
    const fn = vi.fn();
    const debounced = debounce(fn, { wait: 100 });

    debounced();
    debounced.cancel();
    vi.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();
  });

  it('should force next call immediately', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, { wait: 100, leading: true });

    debounced();
    debounced.forceNext();
    debounced();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should call at maxWait even with continuous calls', async () => {
    const fn = vi.fn();
    const debounced = debounce(fn, { wait: 50, maxWait: 200 });

    for (let i = 0; i < 5; i++) {
      debounced();
      vi.advanceTimersByTime(40); // keep calling under wait threshold
    }

    vi.advanceTimersByTime(100); // advance to exceed maxWait
    await Promise.resolve();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should preserve `this` context', async () => {
    const obj = {
      value: 42,
      fn(this: { value: number }) {
        return this.value;
      },
    };

    const spy = vi.fn(obj.fn);
    const debounced = debounce(spy, { wait: 100 });

    debounced.call(obj);
    vi.advanceTimersByTime(100);
    await Promise.resolve();
    expect(spy).toHaveBeenCalledWith();
    expect(spy.mock.results[0].value).toBe(42);
  });
});
