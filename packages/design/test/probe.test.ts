// The probe on small pages in a real browser (it measures layout, so it needs one). Chrome from MARIACHI_CHROME, else
// the installed Chrome channel; without a browser these tests are skipped.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Browser, Page } from 'playwright-core';
import { probeSource } from '../src/fingerprint';
import type { ScreenMeasures } from '../src/fingerprint';

let browser: Browser | undefined;
let page: Page | undefined;

beforeAll(async () => {
  try {
    const { chromium } = await import('playwright-core');
    browser = await chromium.launch(process.env.MARIACHI_CHROME ? { executablePath: process.env.MARIACHI_CHROME } : { channel: 'chrome' });
    page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  } catch {
    browser = undefined;
  }
}, 30_000);
afterAll(async () => { await browser?.close(); });

const measure = async (body: string): Promise<ScreenMeasures['measures']> => {
  await page!.setContent(`<!doctype html><html><body style="margin:0;background:#fff;color:#222;font:16px/1.5 sans-serif">${body}</body></html>`);
  return ((await page!.evaluate(probeSource)) as ScreenMeasures).measures;
};
const text = 'A paragraph of body text that runs long enough to wrap onto a second line in a narrow column, so that it reads as body copy and not as a label.';

describe('the probe on a page', () => {
  it('finds a near-black primary by its role, and gives it no hue', async (ctx) => {
    if (!page) return ctx.skip();
    const m = await measure(`<main style="padding:40px;width:480px">
      <h1>Projects</h1><p>${text}</p><p>${text}</p>
      <div style="display:flex;gap:8px;align-items:center">
        <button style="background:#141414;color:#fff;border:0;height:40px;padding:0 16px">Create project</button>
        <button style="background:#fff;color:#141414;border:1px solid #ddd;height:40px;padding:0 16px">Import</button>
        <a href="#" style="background:#2563eb;color:#fff;font-size:12px;line-height:16px;padding:2px 6px">New</a>
      </div></main>`);
    // The small blue link is the only saturated fill, but it isn't button-shaped: the black button is the main action
    expect(m['emphasis.primaries']).toBe(1);
    expect(m['colour.accentHue']).toBeNull();
    expect(m['colour.accentOn']).toMatchObject({ primary: expect.any(Number) });
    // With no saturated fill at all, the black button is still counted (it read as no main action before 1.2)
    const plain = await measure(`<main style="padding:40px;width:480px"><h1>Projects</h1><p>${text}</p>
      <button style="background:#141414;color:#fff;border:0;height:40px;padding:0 16px">Create project</button>
      <button style="background:#f4f4f4;color:#141414;border:0;height:40px;padding:0 16px">Import</button></main>`);
    expect(plain['emphasis.primaries']).toBe(1);
    expect(plain['colour.accentHue']).toBeNull();
  });

  it('still reads a coloured primary and its hue', async (ctx) => {
    if (!page) return ctx.skip();
    const m = await measure(`<main style="padding:40px;width:480px"><h1>Projects</h1><p>${text}</p>
      <button style="background:#2563eb;color:#fff;border:0;height:40px;padding:0 16px">Create project</button>
      <button style="background:#fff;color:#141414;border:1px solid #ddd;height:40px;padding:0 16px">Import</button></main>`);
    expect(m['emphasis.primaries']).toBe(1);
    expect(m['colour.accentHue']).toBeGreaterThan(150);
  });

  it('measures rows inside cards, not the cards', async (ctx) => {
    if (!page) return ctx.skip();
    const row = (h: number) => `<li style="box-sizing:border-box;height:${h}px;border-bottom:1px solid #eee">Row</li>`;
    const card = (inner: string) => `<section class="card" style="border:1px solid #ddd;padding:16px;margin-bottom:16px"><h2 style="margin:0">Card</h2>${inner}</section>`;
    const m = await measure(`<main style="padding:24px;width:600px">
      ${card(`<ul style="list-style:none;margin:0;padding:0">${row(32).repeat(5)}</ul>`)}
      ${card(`<ul style="list-style:none;margin:0;padding:0">${row(48).repeat(3)}</ul>`)}
      ${card(`<p>${text}</p>`)}</main>`);
    // Two groups of rows qualify; the one with more items wins
    expect(m['density.rowHeight']).toBe(32);
  });

  it('counts an inline SVG drawing as a picture, and never an icon', async (ctx) => {
    if (!page) return ctx.skip();
    const icon = '<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6"/></svg>';
    const icons = await measure(`<main style="padding:40px"><p>${text}</p><button>${icon} Save</button>${icon}${icon}</main>`);
    expect(icons['media.area']).toBe(0);
    const art = await measure(`<main style="padding:40px"><p>${text}</p><button>${icon} Save</button>
      <svg width="360" height="225" viewBox="0 0 360 225"><rect width="360" height="225" fill="#fde68a"/><svg x="20" y="20" width="80" height="80"><circle cx="40" cy="40" r="40"/></svg></svg>
      <svg width="200" height="24" viewBox="0 0 200 24"><path d="M0 12 Q50 0 100 12 T200 12" stroke="#222" fill="none"/></svg></main>`);
    // The drawing (360 × 225) and the wide one (200 × 24, over 4,096px²); the SVG nested in the drawing is part of it
    expect(art['media.area']).toBeCloseTo((360 * 225 + 200 * 24) / (1440 * 900), 3);
    expect(art['media.role']).not.toBe('none');
  });
});
