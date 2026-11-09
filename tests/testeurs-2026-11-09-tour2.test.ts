/**
 * Locks the fixes of the second round of naive testers, 2026-11-09 (RECETTE §15.8).
 *  1. Method field in payslip words, with an "I don't know" answer worked out as relief at source.
 *  2. 20% and 25% always said together; the result never shows a bare "Relief by relief at source".
 *  3. A claim above £0 links to "How to claim", and that section is the open first section of its page.
 *  4. SIPP: one figure for the room left, employer money at 0 by default.
 *  5. Carry forward recalls the earnings limit on relief; the eleven-year table is no longer the open section.
 *  6. Example line says what the example assumes; folded summary reads "label: value".
 *  7. Tables no longer show two identical rows on the sacrifice and methods pages.
 */
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { pageById } from '../src/lib/guides';
import { helpers } from '../src/lib/helpers';
import { getTool, METHOD_OPTS_UNSURE } from '../src/lib/tool-specs';
import { getSpec } from '../src/lib/mini-specs';

const h = helpers(true);
const plain = (s: string) => s.replace(/<[^>]+>/g, ' ');
const base = { salary: 45000, amount: 3000, method: 0, nation: 0, other: 0, share: 0, y2029: 0, flex: 0 };

describe('naive testers 2026-11-09, second round', () => {
  it('1. method in payslip words, unsure = relief at source with a note', () => {
    expect(METHOD_OPTS_UNSURE.map((o) => o.label)).toEqual(['From my bank, or after tax (relief at source)', 'Taken from my pay before tax (net pay)', 'My salary is reduced (salary sacrifice)', 'I don’t know: show the usual case']);
    const t = getTool('relief');
    const a = t.run(base), u = t.run({ ...base, method: 3 });
    expect(u.head).toEqual(a.head);
    expect((u.notes ?? [])[0]).toMatch(/^Not sure of your method/);
    expect(t.inputs.find((i) => i.id === 'flex')!.advanced).toBeFalsy();
  });
  it('2. 20% and 25% said together', () => {
    const o = getTool('relief').run(base);
    expect(o.sub).toContain('£1 for every £4 you pay, which is 20% of the £3,750');
    const body = plain(pageById('relief-at-source-vs-net-pay')!.resume(h));
    expect(body).toContain('25% on top of your payment, or 20% of the £100');
    const mini = getSpec('relief-salary').run({ salary: 50000, gross: 5000, nation: 0 });
    expect(mini.rows.map((r) => r[0])).not.toContain('Relief by relief at source');
    expect(getSpec('claim').run({ salary: 68000, paid: 6000, nation: 0 }).rows.map((r) => r[0]).join()).not.toMatch(/band widened/);
  });
  it('3. claim link and open how-to-claim section', () => {
    const t = getTool('relief');
    expect(t.action).toEqual({ page: 'higher-rate-pension-tax-relief', anchor: 'how-to-claim' });
    expect(t.run({ ...base, salary: 60000, amount: 7800 }).action).toBe('How to claim this £1,946, step by step');
    expect(t.run(base).action).toBeUndefined();
    expect(pageById('higher-rate-pension-tax-relief')!.body(h)).toMatch(/^<h2 id="how-to-claim">/);
    expect(getSpec('claim').run({ salary: 68000, paid: 6000, nation: 0 }).note).toContain('on top of the £1,500 your provider has already added');
  });
  it('4. SIPP: one room figure, employer 0', () => {
    expect(pageById('sipp-calculator')!.tool!.props!.employer).toBe(0);
    const o = getTool('sipp').run({ earnings: 60000, pay: 8000, employer: 3000, nation: 0, other: 0 });
    const room = o.rows.filter((r) => /still pay|Still free|Most you could/.test(r[0]));
    expect(room).toEqual([['You can still pay from your bank this year, with relief', '£37,600']]);
    expect(o.notes![0]).toContain('becomes £47,000');
  });
  it('5. carry forward', () => {
    const o = getTool('cf').run({ cur: 90000, s2: 30000, s1: 25000, s0: 10000, member: 1, aaCur: 60000, a2: 60000, a1: 60000, a0: 60000 });
    expect(o.notes![0]).toMatch(/limited to what you earn this year/);
    expect(pageById('carry-forward-calculator')!.body(h)).toMatch(/^<h2>Using the result<\/h2>/);
  });
  it('6. example line and folded summary', () => {
    expect(getTool('relief').exemple!({ salary: 45000, amount: 3000 })).toBe('Example for someone earning £45,000 who pays £3,000 a year into a pension: change any figure below');
    const src = readFileSync(new URL('../src/components/calc/Calc.tsx', import.meta.url), 'utf8');
    expect(src).toContain('`${i.label}: ${valeurAffichee(i, v[i.id])}`');
  });
  it('7. no two identical rows', () => {
    for (const id of ['salary-sacrifice-calculator', 'relief-at-source-vs-net-pay']) {
      const html = pageById(id)!.body(h);
      const rows = [...html.matchAll(/<tr>(.*?)<\/tr>/g)].map((x) => x[1].replace(/<td[^>]*>[^<]*<\/td>/, ''));
      expect(rows.filter((r, k) => rows.indexOf(r) !== k)).toEqual([]);
    }
  });
});
