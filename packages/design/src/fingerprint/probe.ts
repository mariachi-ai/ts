/**
 * The fingerprint probe: measures one rendered screen, at one width, as `docs/design-fingerprint.md` (spec 1)
 * defines it. It runs in the page. Everything it needs is in this file's functions, which `probeSource`
 * joins into one expression for `page.evaluate`, so Mariachi's runner and Ensemble's browser run the same code.
 *
 * Keep every function here self-contained: no imports, no module-level values. They're serialised.
 */

export type MeasureValue = number | string | Record<string, number> | null;
export interface ScreenMeasures {
  specVersion: 1;
  width: number;
  measures: Record<string, MeasureValue>;
}

/** `rgb(…)`, `rgba(…)`, `#rrggbb` → [r, g, b, alpha] (0–255, 0–1), or null for anything else (gradients, `transparent`). */
export function parseCssColor(s: string): [number, number, number, number] | null {
  if (!s) return null;
  const m = s.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)$/);
  if (m) {
    const a = m[4] === undefined ? 1 : m[4].endsWith('%') ? Number.parseFloat(m[4]) / 100 : Number.parseFloat(m[4]);
    return [Number.parseFloat(m[1]), Number.parseFloat(m[2]), Number.parseFloat(m[3]), a];
  }
  const h = s.match(/^#([0-9a-f]{6})$/i);
  if (h) { const n = Number.parseInt(h[1], 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1]; }
  return null;
}

/** sRGB (0–255) → CIE Lab (D65). */
export function rgbToLab(rgb: [number, number, number]): [number, number, number] {
  const lin = (c: number) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const [r, g, b] = rgb.map(lin);
  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

/** CIEDE2000 colour difference between two Lab colours. */
export function deltaE2000(a: [number, number, number], b: [number, number, number]): number {
  const [L1, a1, b1] = a;
  const [L2, a2, b2] = b;
  const rad = Math.PI / 180;
  const C1 = Math.hypot(a1, b1);
  const C2 = Math.hypot(a2, b2);
  const Cm = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7)));
  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;
  const C1p = Math.hypot(a1p, b1);
  const C2p = Math.hypot(a2p, b2);
  const hp = (x: number, y: number) => { if (x === 0 && y === 0) return 0; const h = Math.atan2(y, x) / rad; return h >= 0 ? h : h + 360; };
  const h1p = hp(a1p, b1);
  const h2p = hp(a2p, b2);
  const dLp = L2 - L1;
  const dCp = C2p - C1p;
  let dhp = 0;
  if (C1p * C2p !== 0) { dhp = h2p - h1p; if (dhp > 180) dhp -= 360; else if (dhp < -180) dhp += 360; }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2) * rad);
  const Lmp = (L1 + L2) / 2;
  const Cmp = (C1p + C2p) / 2;
  let Hmp = h1p + h2p;
  if (C1p * C2p !== 0) { if (Math.abs(h1p - h2p) > 180) Hmp = h1p + h2p < 360 ? (h1p + h2p + 360) / 2 : (h1p + h2p - 360) / 2; else Hmp = (h1p + h2p) / 2; }
  const T = 1 - 0.17 * Math.cos((Hmp - 30) * rad) + 0.24 * Math.cos(2 * Hmp * rad) + 0.32 * Math.cos((3 * Hmp + 6) * rad) - 0.2 * Math.cos((4 * Hmp - 63) * rad);
  const dTheta = 30 * Math.exp(-(((Hmp - 275) / 25) ** 2));
  const Rc = 2 * Math.sqrt(Cmp ** 7 / (Cmp ** 7 + 25 ** 7));
  const Sl = 1 + (0.015 * (Lmp - 50) ** 2) / Math.sqrt(20 + (Lmp - 50) ** 2);
  const Sc = 1 + 0.045 * Cmp;
  const Sh = 1 + 0.015 * Cmp * T;
  const Rt = -Math.sin(2 * dTheta * rad) * Rc;
  return Math.sqrt((dLp / Sl) ** 2 + (dCp / Sc) ** 2 + (dHp / Sh) ** 2 + Rt * (dCp / Sc) * (dHp / Sh));
}

/** sRGB (0–255) → OKLCH [L 0–1, C, H degrees]. */
export function rgbToOklch(rgb: [number, number, number]): [number, number, number] {
  const lin = (c: number) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const [r, g, b] = rgb.map(lin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const H = (Math.atan2(B, A) * 180) / Math.PI;
  return [L, Math.hypot(A, B), H < 0 ? H + 360 : H];
}

/** Measures the screen in the current page. Runs in the browser. */
export function measureScreen(): ScreenMeasures {
  const W = innerWidth;
  const H = innerHeight;
  const px = (v: string) => Number.parseFloat(v) || 0;
  const med = (xs: number[]) => { if (!xs.length) return null; const s = [...xs].sort((a, b) => a - b); const i = s.length >> 1; return s.length % 2 ? s[i] : (s[i - 1] + s[i]) / 2; };
  const shares = (counts: Record<string, number>) => { const t = Object.values(counts).reduce((a, b) => a + b, 0); if (!t) return null; const o: Record<string, number> = {}; for (const [k, v] of Object.entries(counts)) o[k] = Math.round((v / t) * 1000) / 1000; return o; };
  const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
  const csCache = new Map<Element, CSSStyleDeclaration>();
  const cs = (e: Element) => { let s = csCache.get(e); if (!s) { s = getComputedStyle(e); csCache.set(e, s); } return s; };
  const all = [...document.body.querySelectorAll('*')];
  const box = new Map(all.map((e) => [e, e.getBoundingClientRect()] as const));
  const rectOf = (e: Element) => box.get(e) ?? e.getBoundingClientRect();
  const visible = (e: Element) => { const r = rectOf(e);
const s = cs(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && px(s.opacity) > 0; };
  const inWin = (r: DOMRect) => r.bottom > 0 && r.top < H && r.right > 0 && r.left < W;
  // Cookie and consent notices are left out of every measure: a pinned panel that talks about cookies or consent
  const consent = all.filter((e) => /fixed|sticky/.test(cs(e).position) && /\b(cookies?|consent|privacy choices)\b/i.test(e.textContent ?? ''));
  const vis = all.filter((e) => visible(e) && !consent.some((c) => c === e || c.contains(e)));
  const visSet = new Set(vis);
  const lab = (c: [number, number, number, number]) => rgbToLab([c[0], c[1], c[2]]);
  const clipArea = (r: DOMRect) => Math.max(0, Math.min(r.right, W) - Math.max(r.left, 0)) * Math.max(0, Math.min(r.bottom, H) - Math.max(r.top, 0));

  const CONTROL = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="link"], [role="tab"], [role="checkbox"], [role="radio"], [role="switch"], [role="menuitem"], [role="option"]';
  // Effective backgrounds: the nearest opaque-ish background up the tree, else the page's
  const rootBg = parseCssColor(cs(document.documentElement).backgroundColor);
  const bodyBg = parseCssColor(cs(document.body).backgroundColor);
  const canvas: [number, number, number, number] = bodyBg && bodyBg[3] > 0.5 ? bodyBg : rootBg && rootBg[3] > 0.5 ? rootBg : [255, 255, 255, 1];
  // A fill: the background colour, or a gradient's first colour stop (a primary painted as a gradient is still a fill)
  const ownBg = (e: Element) => {
    const c = parseCssColor(cs(e).backgroundColor);
    if (c && c[3] > 0.5) return c;
    const g = cs(e).backgroundImage.match(/gradient\([^)]*?(rgba?\([^)]+\))/);
    const gc = g ? parseCssColor(g[1]) : null;
    if (gc && gc[3] > 0.5) return gc;
    // A face drawn by a pseudo-element covering the control (a button whose face is its ::before)
    if (!e.matches(CONTROL)) return null;
    const before = getComputedStyle(e, '::before');
    const bc = parseCssColor(before.backgroundColor);
    return before.content !== 'none' && before.position === 'absolute' && bc && bc[3] > 0.5 ? bc : null;
  };
  const behind = (e: Element) => { for (let p = e.parentElement; p; p = p.parentElement) { const c = ownBg(p); if (c) return c; } return canvas; };

  // Sets
  const isControl = (e: Element) => e.matches(CONTROL);
  const controls = vis.filter(isControl);
  const drawn = (s: CSSStyleDeclaration, side: string) => px(s.getPropertyValue(`border-${side}-width`)) > 0 && s.getPropertyValue(`border-${side}-style`) !== 'none' && (parseCssColor(s.getPropertyValue(`border-${side}-color`))?.[3] ?? 0) > 0;
  type Sep = { e: Element; kinds: string[] };
  const separated: Sep[] = [];
  const sepSet = new Set<Element>();
  for (const e of vis) {
    if (isControl(e)) continue;
    const r = rectOf(e);
    if (r.width < 80 || r.height < 32 || ![...e.children].some((c) => visSet.has(c))) continue;
    const s = cs(e);
    const kinds: string[] = [];
    const four = ['top', 'right', 'bottom', 'left'].every((k) => drawn(s, k));
    if (four) kinds.push('border');
    if (s.boxShadow && s.boxShadow !== 'none') kinds.push('shadow');
    const bg = ownBg(e);
    if (bg && deltaE2000(lab(bg), lab(behind(e))) >= 2) kinds.push('tint');
    if (!four && (drawn(s, 'top') || drawn(s, 'bottom')) && !drawn(s, 'left') && !drawn(s, 'right') && r.width >= 0.5 * (e.parentElement?.getBoundingClientRect().width ?? W)) kinds.push('divider');
    if (kinds.length) { separated.push({ e, kinds }); sepSet.add(e); }
  }

  // Text runs, with their line boxes
  type Run = { el: Element; size: number; weight: number; len: number; color: [number, number, number, number] | null; rects: DOMRect[]; text: string };
  const runs: Run[] = [];
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    const text = (n.textContent ?? '').trim();
    const el = n.parentElement;
    if (!text || !el || !visSet.has(el)) continue;
    const s = cs(el);
    const range = document.createRange();
    range.selectNodeContents(n);
    runs.push({ el, size: Math.round(px(s.fontSize) * 2) / 2, weight: px(s.fontWeight), len: text.length, color: parseCssColor(s.color), rects: [...range.getClientRects()], text });
  }
  const winRuns = runs.filter((r) => r.rects.some(inWin));
  const chars = (rs: Run[], key: (r: Run) => number) => { const m = new Map<number, number>(); for (const r of rs) m.set(key(r), (m.get(key(r)) ?? 0) + r.len); return m; };
  const bySize = chars(winRuns, (r) => r.size);
  const byWeight = chars(winRuns, (r) => r.weight);
  const body = [...bySize.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 16;
  const bodyRuns = winRuns.filter((r) => r.size === body);
  const bodyWeight = [...chars(bodyRuns, (r) => r.weight).entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 400;
  const bodyColorRun = [...bodyRuns].sort((a, b) => b.len - a.len)[0];
  const sizes = [...bySize.entries()].filter(([, c]) => c >= 3).map(([s]) => s);
  const m: Record<string, MeasureValue> = {};

  // Type
  m['type.sizes'] = sizes.length;
  m['type.headingRatio'] = sizes.length ? round(Math.max(...sizes) / body) : null;
  m['type.weights'] = [...byWeight.entries()].filter(([, c]) => c >= 3).length;
  const lineLengths: number[] = [];
  for (const e of vis) {
    const s = cs(e);
    if (Math.round(px(s.fontSize) * 2) / 2 !== body || !/^(P|LI|DD|BLOCKQUOTE)$/.test(e.tagName) || !inWin(rectOf(e))) continue;
    const lh = s.lineHeight === 'normal' ? px(s.fontSize) * 1.2 : px(s.lineHeight);
    const lines = Math.round(rectOf(e).height / lh);
    if (lines >= 2) lineLengths.push((e.textContent ?? '').trim().length / lines);
  }
  m['type.lineLength'] = lineLengths.length ? round(med(lineLengths)!, 0) : null;
  const headingEls = new Set<Element>(vis.filter((e) => /^H[1-6]$/.test(e.tagName) && inWin(rectOf(e))));
  for (const r of winRuns) if (r.size >= body * 1.2) headingEls.add(r.el);
  const pGaps: number[] = [];
  for (const e of vis) if (e.tagName === 'P' && e.previousElementSibling?.tagName === 'P') pGaps.push(rectOf(e).top - rectOf(e.previousElementSibling).bottom);
  const pGap = med(pGaps) ?? 16;
  const emph = { size: 0, weight: 0, colour: 0, space: 0 };
  for (const e of headingEls) {
    const s = cs(e);
    const c = parseCssColor(s.color);
    const prev = e.previousElementSibling;
    if (px(s.fontSize) >= body * 1.2) emph.size++;
    if (px(s.fontWeight) >= bodyWeight + 200) emph.weight++;
    if (c && bodyColorRun?.color && deltaE2000(lab(c), lab(bodyColorRun.color)) >= 10) emph.colour++;
    if (prev && rectOf(e).top - rectOf(prev).bottom >= 1.5 * pGap) emph.space++;
  }
  m['type.headingEmphasis'] = headingEls.size ? Object.fromEntries(Object.entries(emph).map(([k, v]) => [k, round(v / headingEls.size, 3)])) : null;

  // Collections, the main column, media, icons (used by several measures)
  type Coll = { parent: Element; items: Element[]; kind: string };
  const colls: Coll[] = [];
  for (const p of vis) {
    if (p.closest('svg')) continue; // an icon's paths aren't a list
    const kids = [...p.children].filter((k) => visSet.has(k));
    if (kids.length < 3) continue;
    const sig = (k: Element) => `${k.tagName}.${(k.getAttribute('class') ?? '').split(/\s+/)[0]}`;
    const groups = new Map<string, Element[]>();
    for (const k of kids) groups.set(sig(k), [...(groups.get(sig(k)) ?? []), k]);
    const items = [...groups.values()].sort((a, b) => b.length - a.length)[0];
    if (items.length < 3) continue;
    const xs = new Set(items.map((k) => Math.round(rectOf(k).left / 8)));
    const ys = new Set(items.map((k) => Math.round(rectOf(k).top / 8)));
    const kind = p.tagName === 'TBODY' ? 'table' : p.scrollWidth > p.clientWidth + 8 && ys.size === 1 ? 'carousel' : xs.size > 1 && ys.size > 1 ? 'grid' : xs.size === 1 ? 'list' : '';
    if (kind) colls.push({ parent: p, items, kind });
  }
  const textIn = new Map<Element, number>();
  for (const r of winRuns) for (let p: Element | null = r.el; p && p !== document.body; p = p.parentElement) textIn.set(p, (textIn.get(p) ?? 0) + r.len);
  const blockKids = (e: Element) => [...e.children].filter((k) => visSet.has(k) && !/^inline/.test(cs(k).display));
  const mainCol = vis.filter((e) => !/^(NAV|ASIDE|HEADER|FOOTER)$/.test(e.tagName) && blockKids(e).length >= 3).sort((a, b) => (textIn.get(b) ?? 0) - (textIn.get(a) ?? 0))[0] ?? document.body;
  const media = vis.filter((e) => {
    const r = rectOf(e);
    const s = cs(e);
    if (r.width < 48 || r.height < 48 || (r.width >= W * 0.95 && r.height >= H * 0.6)) return false;
    if (/^(IMG|VIDEO|CANVAS|PICTURE)$/.test(e.tagName)) return true;
    return s.backgroundImage !== 'none' && !(e.textContent ?? '').trim();
  });
  const icons = vis.filter((e) => { const r = rectOf(e); return (e.tagName.toLowerCase() === 'svg' || (e.tagName === 'IMG' && /\.svg/i.test((e as HTMLImageElement).src))) && r.width <= 32 && r.height <= 32; });

  // Space
  const cols = Math.ceil(W / 8);
  const rows = Math.ceil(H / 8);
  const ink = new Uint8Array(cols * rows);
  const mark = (r: { left: number; top: number; right: number; bottom: number }) => {
    for (let y = Math.max(0, Math.floor(r.top / 8)); y < Math.min(rows, Math.ceil(r.bottom / 8)); y++)
      for (let x = Math.max(0, Math.floor(r.left / 8)); x < Math.min(cols, Math.ceil(r.right / 8)); x++) ink[y * cols + x] = 1;
  };
  for (const r of winRuns) for (const lr of r.rects) mark(lr);
  for (const e of [...media, ...controls, ...icons]) mark(rectOf(e));
  for (const { e } of separated) { const r = rectOf(e); mark({ left: r.left, top: r.top, right: r.right, bottom: r.top + 1 }); mark({ left: r.left, top: r.bottom - 1, right: r.right, bottom: r.bottom }); mark({ left: r.left, top: r.top, right: r.left + 1, bottom: r.bottom }); mark({ left: r.right - 1, top: r.top, right: r.right, bottom: r.bottom }); }
  m['space.empty'] = round(1 - ink.reduce((a, b) => a + b, 0) / ink.length, 3);
  const rootCs = cs(document.documentElement);
  const remPx = px(rootCs.fontSize) || 16;
  const toPx = (v: string) => (v.trim().endsWith('rem') ? px(v) * remPx : px(v));
  const scale = Array.from({ length: 16 }, (_, i) => toPx(rootCs.getPropertyValue(`--m-space-${i + 1}`))).filter((v) => v > 0);
  const snap = (v: number) => (scale.length ? scale.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a), scale[0]) : Math.round(v / 4) * 4);
  const gapsOf = (e: Element) => { const k = blockKids(e).map(rectOf).sort((a, b) => a.top - b.top);
const out: number[] = []; for (let i = 1; i < k.length; i++) { const d = k[i].top - k[i - 1].bottom; if (d >= 0) out.push(d); } return out; };
  const stepCounts: Record<string, number> = {};
  for (const e of vis) {
    if (!inWin(rectOf(e))) continue;
    for (const g of gapsOf(e)) if (g > 0) { const k = String(snap(g)); stepCounts[k] = (stepCounts[k] ?? 0) + 1; }
    if (sepSet.has(e)) { const p = px(cs(e).paddingTop); if (p > 0) { const k = String(snap(p)); stepCounts[k] = (stepCounts[k] ?? 0) + 1; } }
  }
  m['space.steps'] = shares(stepCounts);
  const outer = gapsOf(mainCol);
  const inner = blockKids(mainCol).flatMap(gapsOf);
  m['space.sectionRatio'] = med(outer) !== null && med(inner) ? round(med(outer)! / med(inner)!) : null;
  const mainText = winRuns.filter((r) => mainCol.contains(r.el)).flatMap((r) => r.rects).filter(inWin);
  if (mainText.length) {
    const left = Math.min(...mainText.map((r) => r.left));
    const right = Math.max(...mainText.map((r) => r.right));
    m['space.contentWidth'] = round((right - left) / W, 3);
    m['space.contentWidthPx'] = Math.round(right - left);
    m['space.gutter'] = Math.round(left);
  } else { m['space.contentWidth'] = null; m['space.contentWidthPx'] = null; m['space.gutter'] = null; }

  // Density
  m['density.elements'] = vis.filter((e) => inWin(rectOf(e)) && ![...e.children].some((c) => visSet.has(c))).length;
  m['density.targets'] = controls.filter((e) => inWin(rectOf(e))).length;
  const listy = colls.filter((c) => c.kind === 'list' || c.kind === 'table');
  m['density.rowsVisible'] = listy.length ? med(listy.map((c) => c.items.filter((i) => inWin(rectOf(i))).length)) : null;
  m['density.rowHeight'] = listy.length ? med(listy.map((c) => med(c.items.map((i) => rectOf(i).height))!)) : null;

  // Structure
  let depth = 0;
  for (const { e } of separated) { let d = 0; for (let p: Element | null = e; p; p = p.parentElement) if (sepSet.has(p)) d++; depth = Math.max(depth, d); }
  m['structure.depth'] = depth;
  const sepCounts: Record<string, number> = { border: 0, shadow: 0, tint: 0, divider: 0 };
  for (const { kinds } of separated) for (const k of kinds) sepCounts[k]++;
  const sepShares = separated.length ? Object.fromEntries(Object.entries(sepCounts).map(([k, v]) => [k, round(v / separated.length, 3)])) : { border: 0, shadow: 0, tint: 0, divider: 0 };
  m['structure.separation'] = { ...sepShares, space: colls.length ? round(colls.filter((c) => !c.items.some((i) => sepSet.has(i))).length / colls.length, 3) : 0 };
  const top = blockKids(mainCol).filter((k) => rectOf(k).width >= 120);
  let columns = top.length ? 1 : 0;
  for (const a of top) { const ra = rectOf(a); const lefts = new Set(top.filter((b) => { const rb = rectOf(b); return rb.top < ra.bottom && rb.bottom > ra.top; }).map((b) => Math.round(rectOf(b).left / 8))); columns = Math.max(columns, lefts.size); }
  m['structure.columns'] = columns;
  const collCounts: Record<string, number> = {};
  for (const c of colls) collCounts[c.kind] = (collCounts[c.kind] ?? 0) + 1;
  m['structure.collections'] = shares(collCounts);

  // Colour
  // The action colour as drawn: the declared primary's fill, else the most common saturated control fill, else the token
  const declaredPrimary = vis.find((e) => e.matches('.m-button[data-variant="primary"]'));
  let accent = declaredPrimary ? ownBg(declaredPrimary) : null;
  if (!accent) {
    const tally = new Map<string, number>();
    for (const e of controls) { const c = ownBg(e); if (c && rgbToOklch([c[0], c[1], c[2]])[1] > 0.1) tally.set(c.slice(0, 3).join(','), (tally.get(c.slice(0, 3).join(',')) ?? 0) + 1); }
    const best = [...tally.entries()].sort((a, b) => b[1] - a[1])[0];
    accent = best ? ([...best[0].split(',').map(Number), 1] as [number, number, number, number]) : parseCssColor(rootCs.getPropertyValue('--m-color-accent-default').trim());
  }
  const near = (c: [number, number, number, number] | null, ref: [number, number, number, number] | null, d: number) => !!c && !!ref && c[3] > 0.5 && deltaE2000(lab(c), lab(ref)) <= d;
  const isPrimary = (e: Element) => isControl(e) && (e.matches('.m-button[data-variant="primary"]') || near(ownBg(e), accent, 5));
  let accentArea = 0;
  const accentOn: Record<string, number> = {};
  const tag = (e: Element, k: string) => { accentOn[k] = (accentOn[k] ?? 0) + 1; void e; };
  for (const e of vis) {
    const r = rectOf(e);
    if (!inWin(r)) continue;
    if (near(ownBg(e), accent, 5)) {
      accentArea += clipArea(r);
      if (isPrimary(e)) tag(e, 'primary');
      else if (e.matches('[aria-selected="true"], [aria-current], :checked')) tag(e, 'selection');
      else if (/badge|chip|tag|pill/i.test(e.getAttribute('class') ?? '') || (r.height <= 28 && (e.textContent ?? '').trim().length <= 24)) tag(e, 'badge');
      else tag(e, 'other');
    }
    if (e.tagName.toLowerCase() === 'svg' && near(parseCssColor(cs(e).color), accent, 5)) tag(e, 'icon');
  }
  for (const r of winRuns) if (near(r.color, accent, 5)) { for (const lr of r.rects) accentArea += clipArea(lr); if (r.el.closest('a[href]') && !isPrimary(r.el.closest('a[href]')!)) tag(r.el, 'link'); }
  m['colour.accentArea'] = accent ? round(Math.min(1, accentArea / (W * H)), 3) : null;
  m['colour.accentOn'] = shares(accentOn);
  const hueArea = new Map<number, number>();
  let satArea = 0;
  let statusSat = 0;
  const STATUS = '[role="status"], [role="alert"], .m-badge, .m-alert, [class*="badge"], [class*="alert"]';
  const addSat = (c: [number, number, number, number] | null, area: number, e: Element) => {
    if (!c || c[3] < 0.5 || area <= 0) return;
    const [, C, Hh] = rgbToOklch([c[0], c[1], c[2]]);
    if (C <= 0.08) return;
    satArea += area; if (e.closest(STATUS)) statusSat += area;
    const bin = Math.floor(Hh / 30) % 12; hueArea.set(bin, (hueArea.get(bin) ?? 0) + area);
  };
  for (const e of vis) { const r = rectOf(e); if (inWin(r)) addSat(ownBg(e), clipArea(r), e); }
  for (const r of winRuns) addSat(r.color, r.rects.reduce((a, lr) => a + clipArea(lr), 0), r.el);
  m['colour.hues'] = [...hueArea.values()].filter((a) => a >= 0.002 * W * H).length;
  m['colour.meaning'] = satArea ? round(statusSat / satArea, 3) : null;

  // Shape
  const buckets: Record<string, number[]> = { '<40': [], '40-120': [], '120-400': [], '>400': [] };
  for (const e of [...separated.map((s) => s.e), ...controls]) {
    const r = rectOf(e);
    const rad = cs(e).borderTopLeftRadius;
    const v = rad.endsWith('%') ? (px(rad) / 100) * r.width : px(rad);
    buckets[r.height < 40 ? '<40' : r.height < 120 ? '40-120' : r.height < 400 ? '120-400' : '>400'].push(Math.min(v, r.height / 2));
  }
  m['shape.radiusBySize'] = Object.fromEntries(Object.entries(buckets).filter(([, v]) => v.length).map(([k, v]) => [k, med(v)!]));
  const bs = { borderOnly: 0, shadowOnly: 0, both: 0 };
  for (const { kinds } of separated) { const b = kinds.includes('border');
const s = kinds.includes('shadow'); if (b && s) bs.both++; else if (b) bs.borderOnly++; else if (s) bs.shadowOnly++; }
  m['shape.borderAndShadow'] = shares(bs);

  // Emphasis
  const prim = controls.filter(isPrimary);
  const primWin = prim.filter((e) => inWin(rectOf(e)));
  m['emphasis.primaries'] = primWin.length;
  m['emphasis.primariesPage'] = prim.length;
  const at: Record<string, number> = {};
  const inItem = new Set(colls.flatMap((c) => c.items));
  for (const e of primWin) {
    const r = rectOf(e);
    const cx = (r.left + r.right) / 2;
    const cy = (r.top + r.bottom) / 2;
    const cell = `${['top', 'middle', 'bottom'][Math.min(2, Math.floor((cy / H) * 3))]}-${['left', 'centre', 'right'][Math.min(2, Math.floor((cx / W) * 3))]}`;
    at[cell] = (at[cell] ?? 0) + 1;
    for (let p: Element | null = e; p; p = p.parentElement) { if (/fixed|sticky/.test(cs(p).position)) { at.pinned = (at.pinned ?? 0) + 1; break; } }
    for (let p: Element | null = e; p; p = p.parentElement) { if (inItem.has(p)) { at.inRow = (at.inRow ?? 0) + 1; break; } }
  }
  m['emphasis.primaryAt'] = shares(at);
  m['emphasis.primaryWidth'] = primWin.length ? round(med(primWin.map((e) => rectOf(e).width / (e.parentElement?.getBoundingClientRect().width || W)))!, 3) : null;
  const danger = parseCssColor(rootCs.getPropertyValue('--m-color-danger-solid').trim()) ?? parseCssColor(rootCs.getPropertyValue('--m-color-danger-fg').trim());
  const destr: Record<string, number> = {};
  for (const e of controls) {
    const t = (e.textContent ?? '').trim();
    const bgD = near(ownBg(e), danger, 10);
    const fgD = near(parseCssColor(cs(e).color), danger, 10);
    if (!/\b(delete|remove|discard|cancel subscription|close account)\b/i.test(t) && !bgD && !fgD) continue;
    const k = bgD ? 'dangerFill' : fgD ? 'dangerText' : 'plain';
    destr[k] = (destr[k] ?? 0) + 1;
  }
  m['emphasis.destructive'] = Object.keys(destr).length ? Object.entries(destr).sort((a, b) => b[1] - a[1])[0][0] : null;

  // Icons and pictures
  m['icons.size'] = icons.length ? med(icons.map((e) => rectOf(e).width)) : null;
  const ctlIcons = icons.filter((e) => e.closest(CONTROL));
  m['icons.labelled'] = ctlIcons.length ? round(ctlIcons.filter((e) => (e.closest(CONTROL)?.textContent ?? '').trim().length > 0).length / ctlIcons.length, 3) : null;
  const winMedia = media.filter((e) => inWin(rectOf(e)));
  m['media.area'] = round(Math.min(1, winMedia.reduce((a, e) => a + clipArea(rectOf(e)), 0) / (W * H)), 3);
  const big = [...winMedia].sort((a, b) => clipArea(rectOf(b)) - clipArea(rectOf(a)))[0];
  if (big) {
    const r = rectOf(big);
    const colW = rectOf(mainCol).width || W;
    m['media.role'] = r.width >= W * 0.95 ? 'fullBleed' : r.width >= 0.5 * colW ? 'leads' : r.width >= 0.15 * colW ? 'inset' : 'thumb';
    m['media.aspect'] = round(r.width / r.height);
  } else { m['media.role'] = 'none'; m['media.aspect'] = null; }

  // Motion (declared)
  const dur: Record<string, number> = {};
  const props: Record<string, number> = {};
  const ms = (v: string) => v.split(',').map((x) => (x.trim().endsWith('ms') ? px(x) : px(x) * 1000)).filter((x) => x > 0);
  for (const e of vis) {
    const s = cs(e);
    const d = [...ms(s.transitionDuration), ...ms(s.animationDuration)];
    for (const x of d) dur[String(Math.round(x))] = (dur[String(Math.round(x))] ?? 0) + 1;
    if (ms(s.transitionDuration).length) for (const p of s.transitionProperty.split(',').map((x) => x.trim())) if (p && p !== 'none') props[p] = (props[p] ?? 0) + 1;
  }
  m['motion.durations'] = Object.keys(dur).length ? dur : null;
  m['motion.properties'] = Object.keys(props).length ? props : null;

  // Words (on the page)
  const words = (t: string) => t.split(/\s+/).filter(Boolean);
  const caseOf = (t: string) => { const w = words(t).filter((x) => /[A-Za-z]/.test(x)); if (!w.length) return null; if (w.every((x) => x === x.toUpperCase()) && t.length > 3) return 'upper'; if (w.length > 1 && w.filter((x) => x.length > 3).every((x) => /^[A-Z]/.test(x))) return 'title'; return 'sentence'; };
  const heads = vis.filter((e) => /^H[1-6]$/.test(e.tagName)).map((e) => (e.textContent ?? '').trim()).filter(Boolean);
  const buttons = vis.filter((e) => e.matches('button, [role="button"], .m-button')).map((e) => (e.textContent ?? '').trim()).filter(Boolean);
  m['words.headingLength'] = heads.length ? med(heads.map((t) => words(t).length)) : null;
  const caseCounts: Record<string, number> = {};
  for (const t of [...heads, ...buttons]) { const c = caseOf(t); if (c) caseCounts[c] = (caseCounts[c] ?? 0) + 1; }
  m['words.case'] = shares(caseCounts);
  m['words.buttonLength'] = buttons.length ? med(buttons.map((t) => words(t).length)) : null;
  const pageText = runs.map((r) => r.text).join(' ');
  const total = words(pageText).length || 1;
  const count = (re: RegExp) => (pageText.match(re) ?? []).length;
  m['words.person'] = { you: round((count(/\byou(r|rs)?\b/gi) / total) * 1000, 1), we: round((count(/\b(we|our|us)\b/gi) / total) * 1000, 1) };
  const FORMATS: [string, RegExp][] = [
    ['date:d mon yyyy', /\b\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}\b/g],
    ['date:mon d', /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2}\b/g],
    ['date:iso', /\b\d{4}-\d{2}-\d{2}\b/g],
    ['date:numeric', /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g],
    ['time:24h', /\b([01]?\d|2[0-3]):[0-5]\d\b(?!\s?[ap]m)/gi],
    ['time:12h', /\b(1[0-2]|0?[1-9])(:[0-5]\d)?\s?[ap]m\b/gi],
    ['money:symbol', /[$€£¥]\s?\d/g],
    ['money:code', /\b\d[\d,.]*\s?(USD|EUR|GBP)\b/g],
    ['number:comma', /\b\d{1,3}(,\d{3})+\b/g],
    ['number:short', /\b\d+(\.\d+)?[kKMB]\b/g],
  ];
  const fmts: Record<string, number> = {};
  for (const [k, re] of FORMATS) { const n = count(re); if (n) fmts[k] = n; }
  m['words.formats'] = Object.keys(fmts).length ? fmts : null;

  // States
  const mr = rectOf(mainCol);
  m['states.centred'] = Math.abs((mr.left + mr.right) / 2 - W / 2) <= 0.1 * W && Math.abs((Math.max(0, mr.top) + Math.min(H, mr.bottom)) / 2 - H / 2) <= 0.1 * H ? 1 : 0;

  return { specVersion: 1, width: W, measures: m };
}

/** The probe as one expression for `page.evaluate(probeSource)`: the helpers, then `measureScreen()`. */
export const probeSource = `(() => {\n${[parseCssColor, rgbToLab, deltaE2000, rgbToOklch, measureScreen].map(String).join('\n')}\nreturn measureScreen();\n})()`;
