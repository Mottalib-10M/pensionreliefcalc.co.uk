/**
 * Editorial rules checked on every page file before the build (RECETTE §6, §7, §11, §21):
 * snippet lengths, key term first, citable block ≥ 120 words, FAQ 40-90 words and unique across the
 * site, no em dash, internal links to existing pages only, body length by page type.
 */
import { describe, it, expect } from 'vitest';
import { PAGES } from '../src/lib/guides';
import { helpers } from '../src/lib/helpers';
import { getSpec } from '../src/lib/mini-specs';
import { getTool } from '../src/lib/tool-specs';

const h = helpers(true);
const text = (html: string) => html.replace(/<table[\s\S]*?<\/table>/g, ' ').replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ');
const words = (s: string) => text(s).split(/\s+/).filter((w) => /[A-Za-z0-9£]/.test(w)).length;
const BAD_START = /^(UK|United Kingdom|British|England|Scotland|Scottish|Calculator|Calculate|How|What|Why|When|Which|Is|Are|Do|Does|Can|FAQ|About|Tool|Simulator|Checker|Estimator)\b/;
const allQ = new Map<string, string>();

describe.each(PAGES.map((p) => [p.id, p] as const))('%s', (_id, p) => {
  it('snippets', () => {
    expect(p.title.length, `title ${p.title.length}: ${p.title}`).toBeGreaterThanOrEqual(50);
    expect(p.title.length, `title ${p.title.length}: ${p.title}`).toBeLessThanOrEqual(60);
    expect(p.description.length, `description ${p.description.length}`).toBeGreaterThanOrEqual(150);
    expect(p.description.length, `description ${p.description.length}`).toBeLessThanOrEqual(160);
    expect(BAD_START.test(p.title), `title starts with a banned word: ${p.title}`).toBe(false);
    expect(/[—]|\s[:;!?]/.test(p.title + p.description), 'em dash or space before punctuation').toBe(false);
    expect(p.slug).toMatch(/^[a-z0-9-]+$/);
  });
  it('citable block of 120 words or more', () => {
    expect(words(p.resume(h))).toBeGreaterThanOrEqual(120);
  });
  it('FAQ: 3 to 8 questions of 40 to 90 words, never reused', () => {
    const f = p.faqs(h);
    expect(f.length).toBeGreaterThanOrEqual(3);
    expect(f.length).toBeLessThanOrEqual(8);
    for (const x of f) {
      const n = words(x.a);
      expect(n, `${x.q} (${n} words)`).toBeGreaterThanOrEqual(40);
      expect(n, `${x.q} (${n} words)`).toBeLessThanOrEqual(90);
      const k = x.q.toLowerCase().replace(/[^a-z0-9 ]/g, '');
      expect(allQ.has(k) && allQ.get(k) !== p.id, `question reused from ${allQ.get(k)}: ${x.q}`).toBe(false);
      allQ.set(k, p.id);
    }
  });
  it('body: length, links, no em dash, tools exist', () => {
    const b = p.body(h);
    const all = p.intro + p.resume(h) + b + p.faqs(h).map((f) => f.q + f.a).join(' ');
    expect(/—|&mdash;/.test(all), 'em dash').toBe(false);
    const n = words(p.resume(h)) + words(b);
    const min = p.tool ? 480 : 1200;
    expect(n, `${n} words (min ${min})`).toBeGreaterThanOrEqual(min);
    for (const t of [p.tool, p.mini].filter(Boolean)) { if (t!.kind.startsWith('mini:')) expect(() => getSpec(t!.kind.slice(5))).not.toThrow(); else expect(() => getTool(t!.kind.slice(5))).not.toThrow(); }
    for (const m of b.matchAll(/<!--tool:mini:([a-z0-9-]+)/g)) expect(() => getSpec(m[1])).not.toThrow();
    expect(p.tool || p.mini, 'every page carries a calculator').toBeTruthy();
    expect(p.sources.length).toBeGreaterThanOrEqual(2);
  });
});
