/**
 * The behaviours in motion.js, with small stand-ins for elements (the repo has no DOM test
 * environment). What needs a real browser (enhance's observers, leave's animations, view
 * transitions) is covered by the gallery's screenshots.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { busy, countUp, leave, type MotionToast, optimistic, prefersReducedMotion } from '../src/motion';

class FakeElement {
  attrs = new Map<string, string>();
  style = { minInlineSize: '', setProperty: vi.fn() };
  dataset: Record<string, string> = {};
  textContent = '';
  listeners: string[] = [];
  removed = false;
  isConnected = true;
  setAttribute(n: string, v: string) {
    this.attrs.set(n, v);
  }
  removeAttribute(n: string) {
    this.attrs.delete(n);
  }
  hasAttribute(n: string) {
    return this.attrs.has(n);
  }
  getBoundingClientRect() {
    return { width: 132.5 };
  }
  addEventListener(type: string) {
    this.listeners.push(type);
  }
  removeEventListener(type: string) {
    this.listeners.splice(this.listeners.indexOf(type), 1);
  }
  remove() {
    this.removed = true;
  }
}
const fake = () => new FakeElement() as FakeElement & HTMLElement;
const deferred = () => {
  let resolve!: () => void;
  let reject!: (e: Error) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

afterEach(() => vi.unstubAllGlobals());

describe('busy()', () => {
  it('marks the button busy, holds its width and ignores clicks until the work settles', async () => {
    const button = fake();
    const work = deferred();
    const done = busy(button, work.promise);
    expect(button.attrs.get('data-busy')).toBe('');
    expect(button.attrs.get('aria-busy')).toBe('true');
    expect(button.style.minInlineSize).toBe('132.5px');
    expect(button.listeners).toEqual(['click']);
    work.resolve();
    await done;
    expect(button.hasAttribute('data-busy')).toBe(false);
    expect(button.hasAttribute('aria-busy')).toBe(false);
    expect(button.style.minInlineSize).toBe('');
    expect(button.listeners).toEqual([]);
  });

  it('stays busy until overlapping work has all settled, and passes failures on', async () => {
    const button = fake();
    const a = deferred();
    const b = deferred();
    const first = busy(button, a.promise);
    const second = busy(button, () => b.promise);
    a.resolve();
    await first;
    expect(button.hasAttribute('data-busy')).toBe(true);
    b.reject(new Error('offline'));
    await expect(second).rejects.toThrow('offline');
    expect(button.hasAttribute('data-busy')).toBe(false);
  });
});

describe('optimistic()', () => {
  it('applies at once, marks it pending, and confirms quietly', async () => {
    const el = fake();
    const notify = vi.fn();
    const apply = vi.fn();
    const undo = vi.fn();
    const save = deferred();
    const result = optimistic(el, apply, () => save.promise, { undo, notify });
    expect(apply).toHaveBeenCalledOnce();
    expect(el.hasAttribute('data-pending')).toBe(true);
    expect(el.attrs.get('aria-busy')).toBe('true');
    save.resolve();
    expect(await result).toBe(true);
    expect(el.hasAttribute('data-pending')).toBe(false);
    expect(undo).not.toHaveBeenCalled();
    expect(notify).not.toHaveBeenCalled();
  });

  it('offers Undo after success when there is a message', async () => {
    const undo = vi.fn();
    const toasts: MotionToast[] = [];
    await optimistic(fake(), () => {}, async () => {}, { undo, message: 'Renamed to Q3 plan', notify: (t) => toasts.push(t) });
    expect(toasts).toMatchObject([{ title: 'Renamed to Q3 plan', tone: 'neutral', action: { label: 'Undo' } }]);
    toasts[0].action?.run();
    expect(undo).toHaveBeenCalledOnce();
  });

  it('reverts on failure and says so, with Try again', async () => {
    const el = fake();
    const undo = vi.fn();
    const toasts: MotionToast[] = [];
    const commit = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined);
    expect(await optimistic(el, () => {}, commit, { undo, error: "Couldn't rename", notify: (t) => toasts.push(t) })).toBe(false);
    expect(undo).toHaveBeenCalledOnce();
    expect(el.hasAttribute('data-pending')).toBe(false);
    expect(toasts[0]).toMatchObject({ title: "Couldn't rename", tone: 'danger', action: { label: 'Try again' } });
    toasts[0].action?.run();
    await vi.waitFor(() => expect(commit).toHaveBeenCalledTimes(2));
  });
});

describe('countUp()', () => {
  it('shows the final number at once under reduced motion, as written', async () => {
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('reduce') }));
    expect(prefersReducedMotion()).toBe(true);
    const el = fake();
    el.textContent = '$12,400';
    await countUp(el);
    expect(el.textContent).toBe('$12,400');
    expect(el.hasAttribute('data-counted')).toBe(true);
    expect(el.hasAttribute('aria-busy')).toBe(false);
  });

  it('formats with Intl when the element carries a format', async () => {
    const el = fake();
    el.textContent = '';
    el.dataset.countFormat = JSON.stringify({ style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
    el.dataset.countLocale = 'en-GB';
    await countUp(el, { to: 1234 });
    expect(el.textContent).toBe('€1,234');
  });

  it('counts frame by frame from 0, aria-busy until it ends', async () => {
    let now = 0;
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frames.push(cb));
    vi.stubGlobal('performance', { now: () => now });
    const el = fake();
    el.textContent = '1,000 users';
    const done = countUp(el, { duration: 100 });
    expect(el.textContent).toBe('0 users');
    expect(el.attrs.get('aria-busy')).toBe('true');
    now = 50;
    frames.shift()?.(now);
    const mid = Number(el.textContent.replace(/\D/g, ''));
    expect(mid).toBeGreaterThan(500);
    expect(mid).toBeLessThan(1000);
    now = 100;
    frames.shift()?.(now);
    await done;
    expect(el.textContent).toBe('1,000 users');
    expect(el.hasAttribute('aria-busy')).toBe(false);
  });
});

describe('leave()', () => {
  it('removes something already detached at once', async () => {
    const el = fake();
    el.isConnected = false;
    await leave(el);
    expect(el.removed).toBe(true);
  });
});
