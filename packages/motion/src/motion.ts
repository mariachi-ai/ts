/**
 * @mariachi/motion's browser file: what CSS can't do on its own. ESM, browser only, no dependencies.
 *
 * ```ts
 * import { enhance } from './design/motion/motion.js';
 * enhance(); // once at start
 * ```
 *
 * Everything reads the language's tokens (`--m-motion-*`, `--m-chart-draw`) from the page, and
 * everything honours `prefers-reduced-motion: reduce`: count-ups show the final number at once,
 * page transitions fade. Nothing here moves focus.
 */
import { easeOut, formatWritten, parseDuration, parseWritten } from './number';

type Root = Document | HTMLElement;

const REDUCED = '(prefers-reduced-motion: reduce)';

/** True when the person has asked for less motion. */
export function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia(REDUCED).matches;
}

/** A time token on an element in milliseconds, resolving var() and calc() the way CSS does. */
function tokenTime(el: Element, name: string, fallback: number): number {
  const raw = getComputedStyle(el).getPropertyValue(name).trim();
  if (!raw) return fallback;
  const direct = parseDuration(raw, Number.NaN);
  if (!Number.isNaN(direct)) return direct;
  const probe = el.ownerDocument.createElement('span');
  probe.style.setProperty('position', 'absolute');
  probe.style.setProperty('transition-duration', raw);
  el.ownerDocument.documentElement.append(probe);
  const resolved = getComputedStyle(probe).transitionDuration;
  probe.remove();
  return parseDuration(resolved, fallback);
}

function within<T extends Element>(node: Element, selector: string): T[] {
  return [...(node.matches(selector) ? [node as T] : []), ...node.querySelectorAll<T>(selector)];
}

// ---------------------------------------------------------------------------------------------
// enhance()

const watched = new WeakSet<Element>();

/** Marks a picture loaded (or failed) so motion.css can blur it up or fade it in. */
function watchMedia(img: HTMLImageElement): void {
  if (watched.has(img) || img.hasAttribute('data-loaded')) return;
  watched.add(img);
  const placeholder = img.dataset.placeholder;
  if (placeholder) img.style.setProperty('--_placeholder', `url("${placeholder.replace(/"/g, '%22')}")`);
  const done = (state: string) => img.setAttribute('data-loaded', state);
  if (img.complete && img.currentSrc) {
    done(img.naturalWidth > 0 ? 'true' : 'error');
    return;
  }
  img.addEventListener('load', () => done('true'), { once: true });
  img.addEventListener('error', () => done('error'), { once: true });
}

/** Sets `--i` on items of a staggered list, counting from 0 within the batch. */
function indexItems(items: Element[]): void {
  items.forEach((item, i) => {
    if (item instanceof HTMLElement || item instanceof SVGElement) item.style.setProperty('--i', String(i));
  });
}

/**
 * Wires up, within `root` (the document by default), and for content added later:
 * - `[data-stagger]` lists: `--i` on every child (CSS covers the first 12 without it), and new
 *   children enter as a batch, counting from 0;
 * - `img.m-media`: `data-loaded` when it loads (blur-up from `data-placeholder`, or a fade);
 * - `[data-count-up]`: counts up once it scrolls into view (see `countUp`);
 * - `[data-busy]`: clicks on it are ignored.
 *
 * Returns a function that stops it.
 */
export function enhance(root: Root = document): () => void {
  const doc = root instanceof Document ? root : root.ownerDocument;
  const scope = root instanceof Document ? root.documentElement : root;
  doc.documentElement.setAttribute('data-m-motion', '');

  const observer =
    typeof IntersectionObserver === 'function'
      ? new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              observer?.unobserve(entry.target);
              void countUp(entry.target as HTMLElement);
            }
          },
          { threshold: 0.4 },
        )
      : undefined;
  const watchCount = (el: HTMLElement) => {
    if (el.hasAttribute('data-counted')) return;
    if (observer) observer.observe(el);
    else void countUp(el);
  };

  const setUp = (node: Element) => {
    for (const list of within(node, '[data-stagger]')) indexItems([...list.children]);
    for (const img of within<HTMLImageElement>(node, 'img.m-media')) watchMedia(img);
    for (const el of within<HTMLElement>(node, '[data-count-up]')) watchCount(el);
  };
  setUp(scope);

  const onClick = (event: Event) => {
    const target = event.target as Element | null;
    if (target?.closest?.('[data-busy]')) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };
  root.addEventListener('click', onClick, true);

  const mutations = new MutationObserver((records) => {
    const batches = new Map<Element, Element[]>();
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType !== 1) continue;
        const el = node as Element;
        const list = el.parentElement;
        if (list?.hasAttribute('data-stagger')) batches.set(list, [...(batches.get(list) ?? []), el]);
        setUp(el);
      }
    }
    for (const items of batches.values()) indexItems(items);
  });
  mutations.observe(scope, { childList: true, subtree: true });

  return () => {
    root.removeEventListener('click', onClick, true);
    mutations.disconnect();
    observer?.disconnect();
  };
}

// ---------------------------------------------------------------------------------------------
// leave()

/**
 * Plays an element's exit (`data-leaving`: the overlay's exit duration and easing, a fade under
 * reduced motion), then removes it. Resolves once it's gone.
 */
export function leave(el: Element): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      el.remove();
      resolve();
    };
    if (!el.isConnected || typeof el.getAnimations !== 'function') return finish();
    el.setAttribute('data-leaving', '');
    // Reading the style starts the exit animation, so getAnimations() sees it
    void getComputedStyle(el).animationName;
    const finite = el.getAnimations().filter((a) => Number.isFinite(Number(a.effect?.getComputedTiming().endTime)));
    if (finite.length === 0) return finish();
    const longest = Math.max(...finite.map((a) => Number(a.effect?.getComputedTiming().endTime) || 0));
    setTimeout(finish, longest + 100);
    Promise.all(finite.map((a) => a.finished)).then(finish, finish);
  });
}

// ---------------------------------------------------------------------------------------------
// busy()

const busyCount = new WeakMap<HTMLElement, number>();
const heldWidth = new WeakMap<HTMLElement, string>();
const blockClick = (event: Event) => {
  event.preventDefault();
  event.stopImmediatePropagation();
};

/**
 * Shows `button` busy until `work` settles: `data-busy` (a spinner in place of its icon, or over
 * its label), `aria-busy="true"`, its width held, and clicks ignored, so it can't be sent twice.
 * Resolves or rejects with `work`.
 */
export async function busy<T>(button: HTMLElement, work: Promise<T> | (() => Promise<T>)): Promise<T> {
  const count = busyCount.get(button) ?? 0;
  if (count === 0) {
    heldWidth.set(button, button.style.minInlineSize);
    const width = button.getBoundingClientRect().width;
    if (width > 0) button.style.minInlineSize = `${width}px`;
    button.setAttribute('data-busy', '');
    button.setAttribute('aria-busy', 'true');
    button.addEventListener('click', blockClick, true);
  }
  busyCount.set(button, count + 1);
  try {
    return await (typeof work === 'function' ? work() : work);
  } finally {
    const left = (busyCount.get(button) ?? 1) - 1;
    busyCount.set(button, left);
    if (left === 0) {
      button.removeAttribute('data-busy');
      button.removeAttribute('aria-busy');
      button.removeEventListener('click', blockClick, true);
      button.style.minInlineSize = heldWidth.get(button) ?? '';
    }
  }
}

// ---------------------------------------------------------------------------------------------
// optimistic() and its toast

/** A toast as `optimistic()` asks for one (pass `notify` to show it with your own toasts). */
export interface MotionToast {
  title: string;
  body?: string;
  tone: 'neutral' | 'danger';
  action?: { label: string; run: () => void };
}

export interface OptimisticOptions {
  /** Puts things back as they were before `apply()`: runs when the commit fails, and on Undo. */
  undo: () => unknown;
  /** After a successful commit, a toast with Undo ("Renamed to Q3 plan"). Without it, success is quiet. */
  message?: string;
  /** The failure toast's title. Default "Couldn't save that change". */
  error?: string;
  /** Where the library's toasts go. Default: the page's `.m-toast-region`, made if missing. */
  region?: HTMLElement;
  /** Shows the toast your own way instead of with the library's `.m-toast` markup. */
  notify?: (toast: MotionToast) => void;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** The library's toast markup (`.m-toast` in a `.m-toast-region`), dismissed with `leave()`. */
function showToast(toast: MotionToast, region?: HTMLElement): void {
  let host = region ?? document.querySelector<HTMLElement>('.m-toast-region');
  if (!host) {
    host = el('section', 'm-toast-region');
    host.setAttribute('aria-live', 'polite');
    host.setAttribute('aria-label', 'Notifications');
    document.body.append(host);
  }
  const node = el('div', 'm-toast');
  node.setAttribute('role', toast.tone === 'danger' ? 'alert' : 'status');
  if (toast.tone === 'danger') node.dataset.tone = 'danger';
  const content = el('div', 'm-toast-content');
  content.append(el('p', 'm-toast-title', toast.title));
  if (toast.body) content.append(el('p', 'm-toast-body', toast.body));
  const dismiss = () => void leave(node);
  if (toast.action) {
    const actions = el('div', 'm-toast-actions');
    const button = el('button', 'm-button', toast.action.label);
    button.type = 'button';
    button.dataset.size = 'sm';
    const { run } = toast.action;
    button.addEventListener('click', () => {
      dismiss();
      run();
    });
    actions.append(button);
    content.append(actions);
  }
  const close = el('button', 'm-toast-close', '✕');
  close.type = 'button';
  close.setAttribute('aria-label', 'Dismiss');
  close.addEventListener('click', dismiss);
  node.append(content, close);
  host.append(node);

  // Dismisses itself, paused while it's hovered or focused
  let remaining = toast.action ? 8000 : 5000;
  let started = Date.now();
  let timer = setTimeout(dismiss, remaining);
  const pause = () => {
    clearTimeout(timer);
    remaining -= Date.now() - started;
  };
  const resume = () => {
    started = Date.now();
    timer = setTimeout(dismiss, Math.max(remaining, 1500));
  };
  node.addEventListener('pointerenter', pause);
  node.addEventListener('pointerleave', resume);
  node.addEventListener('focusin', pause);
  node.addEventListener('focusout', resume);
}

/**
 * An optimistic change, for small edits only (toggles, renames, reordering; never payments or
 * deletions). `apply()` runs at once and `el` gets `data-pending` (dimmed, a small pending mark)
 * while `commit()` runs. If it succeeds, `el` is confirmed (and `message` shows a toast with Undo);
 * if it fails, `undo()` puts things back and a toast says so, with Try again. Resolves true when
 * the change was saved.
 */
export async function optimistic(
  el: HTMLElement,
  apply: () => unknown,
  commit: () => Promise<unknown>,
  options: OptimisticOptions,
): Promise<boolean> {
  const notify = options.notify ?? ((t: MotionToast) => showToast(t, options.region));
  apply();
  el.setAttribute('data-pending', '');
  el.setAttribute('aria-busy', 'true');
  const settle = () => {
    el.removeAttribute('data-pending');
    el.removeAttribute('aria-busy');
  };
  try {
    await commit();
    settle();
    if (options.message) notify({ title: options.message, tone: 'neutral', action: { label: 'Undo', run: () => void options.undo() } });
    return true;
  } catch {
    settle();
    await options.undo();
    notify({
      title: options.error ?? "Couldn't save that change",
      body: 'It has been undone.',
      tone: 'danger',
      action: { label: 'Try again', run: () => void optimistic(el, apply, commit, options) },
    });
    return false;
  }
}

// ---------------------------------------------------------------------------------------------
// countUp()

export interface CountUpOptions {
  /** Start value. Default `data-count-from`, else 0. */
  from?: number;
  /** End value. Default `data-count-to`, else the number in the element's text. */
  to?: number;
  /** Milliseconds. Default the language's `--m-chart-draw`. */
  duration?: number;
}

/**
 * Counts the number in `el` up from 0 (or `from`) to its value, keeping how it's written
 * ("$12,400", "98.6%"), or with `data-count-format` (Intl.NumberFormat options as JSON, plus
 * `data-count-locale`). The element is `aria-busy` while it counts, so screen readers read the
 * final number. Under reduced motion it shows the final number at once.
 */
export function countUp(el: HTMLElement, options: CountUpOptions = {}): Promise<void> {
  const original = el.textContent ?? '';
  const written = parseWritten(original);
  const dataTo = el.dataset.countTo !== undefined ? Number(el.dataset.countTo) : Number.NaN;
  const to = options.to ?? (Number.isFinite(dataTo) ? dataTo : (written?.value ?? 0));
  const dataFrom = el.dataset.countFrom !== undefined ? Number(el.dataset.countFrom) : Number.NaN;
  const from = options.from ?? (Number.isFinite(dataFrom) ? dataFrom : 0);
  let format: (n: number) => string;
  if (el.dataset.countFormat) {
    let intl: Intl.NumberFormat;
    try {
      intl = new Intl.NumberFormat(el.dataset.countLocale || undefined, JSON.parse(el.dataset.countFormat));
    } catch {
      intl = new Intl.NumberFormat(el.dataset.countLocale || undefined);
    }
    format = (n) => intl.format(n);
  } else {
    format = (n) => (written ? formatWritten(written, n) : String(Math.round(n)));
  }
  // The final text is what was written when the target is the written number
  const final = written && to === written.value && options.to === undefined ? original : format(to);
  el.setAttribute('data-counted', '');

  if (prefersReducedMotion() || typeof requestAnimationFrame !== 'function') {
    el.textContent = final;
    return Promise.resolve();
  }
  const duration = options.duration ?? tokenTime(el, '--m-chart-draw', 600);
  el.setAttribute('aria-busy', 'true');
  el.textContent = format(from);
  return new Promise((resolve) => {
    const start = performance.now();
    const frame = (now: number) => {
      const t = duration > 0 ? (now - start) / duration : 1;
      if (t >= 1) {
        el.textContent = final;
        el.removeAttribute('aria-busy');
        resolve();
        return;
      }
      el.textContent = format(from + (to - from) * easeOut(t));
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
}

// ---------------------------------------------------------------------------------------------
// navigate()

/**
 * Runs a single-page app's route change inside a view transition: a short cross-fade, or a slide
 * when the language's `--m-motion-route` is `slide` (a fade under reduced motion). Where view
 * transitions aren't supported it just runs `update`. Resolves once the page has changed.
 * Put `data-theme` on `<html>` so the transition takes the language's timing.
 *
 * ```ts
 * link.addEventListener('click', (e) => { e.preventDefault(); navigate(() => router.push(href)); });
 * ```
 */
export async function navigate(update: () => unknown): Promise<void> {
  if (typeof document.startViewTransition !== 'function') {
    await update();
    return;
  }
  const html = document.documentElement;
  const themed = document.querySelector('[data-theme]') ?? html;
  const route = getComputedStyle(themed).getPropertyValue('--m-motion-route').trim();
  html.setAttribute('data-m-route', route === 'slide' && !prefersReducedMotion() ? 'slide' : 'fade');
  const transition = document.startViewTransition(async () => {
    await update();
  });
  transition.finished.finally(() => html.removeAttribute('data-m-route')).catch(() => {});
  await transition.updateCallbackDone;
}
