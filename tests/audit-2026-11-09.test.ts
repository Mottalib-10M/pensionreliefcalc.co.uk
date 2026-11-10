/**
 * Locks the fixes of the audit and the naive testers of 2026-11-09 (RECETTE §15.8: a repaired text is locked by a test).
 *  1. A figure in the text comes from the same engine call as the calculator (§17.4 rule 7): £1,946 to claim on £60,000.
 *  2. "NI" appears in the relief result only when NI is really saved (salary sacrifice).
 *  3. The Scottish example of the methods page shows a real difference between the methods.
 *  4. The summary bar never covers the form: it appears only once the calculator has scrolled away.
 */
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { pageById } from '../src/lib/guides';
import { helpers } from '../src/lib/helpers';
import { getTool } from '../src/lib/tool-specs';

const h = helpers(true);
const plain = (s: string) => s.replace(/<[^>]+>/g, ' ');

describe('audit 2026-11-09', () => {
  it('£60,000 page: the claim in the text is the claim of the calculator', () => {
    // Five rules, 2026-11-10 (rule 1): the same £3,000 payment as everywhere on the site.
    const r = h.relief({ salary: 60000, method: 'ras', amount: 3000 });
    const body = plain(pageById('pension-tax-relief-on-60000-salary')!.body(h));
    expect(body).toContain(`who pays ${h.m(3000)} from their bank has ${h.m(r.claim)} to claim`);
    expect(h.m(r.claim)).toBe('£750');
    expect(body).not.toContain('£1,950 to claim');
  });
  it('relief result: no NI wording for relief at source or net pay', () => {
    const t = getTool('relief');
    for (const method of [0, 1]) {
      const o = t.run({ salary: 45000, amount: 3000, method, nation: 0, other: 0, share: 0, y2029: 0, flex: 0 });
      expect(o.sub).not.toMatch(/\bNI\b|National Insurance/);
      expect(o.bar!.segments.map((s) => s.label)).not.toContain('NI saved');
    }
    const s = t.run({ salary: 45000, amount: 3000, method: 2, nation: 0, other: 0, share: 0, y2029: 0, flex: 0 });
    expect(s.sub).toMatch(/National Insurance \(NI\)/);
  });
  it('relief result: an England default points to the Scottish figure when it differs', () => {
    const o = getTool('relief').run({ salary: 45000, amount: 3000, method: 0, nation: 0, other: 0, share: 0, y2029: 0, flex: 0 });
    expect((o.notes ?? []).some((n) => n.startsWith('Live in Scotland? Choose it above'))).toBe(true);
  });
  it('methods page: the Scottish example shows the starter rate difference', () => {
    const st = h.R.compareMethods(15000, 1000, 'scotland');
    expect(Math.round(st.ras.netCost)).not.toBe(Math.round(st.netpay.netCost));
    const body = plain(pageById('relief-at-source-vs-net-pay')!.body(h));
    expect(body).toContain(`costs ${h.m(st.ras.netCost)} by relief at source and ${h.m(st.netpay.netCost)} by net pay`);
    expect(body).not.toContain(`nurse on ${h.m(24000)}`);
  });
  it('summary bar: shown only after the calculator has left the screen, marked as an example', () => {
    const src = readFileSync(new URL('../src/components/calc/Calc.tsx', import.meta.url), 'utf8');
    expect(src).toContain('{!embed && past && <div aria-hidden="true" data-barre-resume');
    expect(src).toMatch(/resultatExemple\(touched\) && <strong[^>]*>Example: <\/strong>/);
  });
});
