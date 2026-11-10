/**
 * Mini-calculators, one per subject (RECETTE §9.3). Each one calls the tested engine of `lib/engine/`;
 * none computes tax on its own. A page sets its defaults through the `props` of its ToolDef.
 */
import type { MiniSpec } from './mini-types';
import { P, type CarYear } from './engine/params';
import { relief, compareMethods, contributionToReach100k, hicbc, childBenefitYear } from './engine/relief';
import { incomeTax, BAND_LABEL } from './engine/tax';
import { annualAllowance } from './engine/allowance';
import { sacrificeCar, appropriatePercentage, CAR_YEARS } from './engine/car';
import { NATION_OPTS, nation } from './tool-specs';
import { formatMoney, formatPercent } from './format';

const m = (n: number) => formatMoney(Math.round(n), 0);
const pc = (x: number, d = 0) => formatPercent(x, d);
const money = (id: string, label: string, def: number, help?: string, max = 10_000_000) => ({ id, label, def, unit: '£', max, help });
const salary = (def: number, label = 'Salary before tax, a year') => money('salary', label, def, 'Before any pension deduction');
const nationIn = { id: 'nation', label: 'Where you pay Income Tax', def: 0, options: NATION_OPTS };

const SPECS: Record<string, MiniSpec> = {
  'relief-salary': {
    title: 'What the same contribution costs by each method', cta: 'Open the full relief calculator', ctaPage: 'home',
    inputs: [salary(45000), money('paid', 'You pay in a year', 3000, 'What leaves your bank or your payslip, before any top-up'), nationIn],
    run: (v) => { const gross = v.paid / (1 - P.relief.rasRate); const c = compareMethods(v.salary, gross, nation(v.nation));
      return { head: ['What it really costs you, paid from your bank', m(c.ras.netCost)], assume: `For one tax year, ${P.taxYear} · salary ${m(v.salary)} · ${m(gross)} reaching the pension, top-up included · after any claim to HMRC`, rows: [['Taken from your pay before tax (net pay)', m(c.netpay.netCost)], ['By salary sacrifice', m(c.sacrifice.netCost)], ['Your top tax rate', BAND_LABEL[c.ras.topBandBefore] === 'basic rate' && nation(v.nation) === 'ruk' ? 'basic rate (20%)' : BAND_LABEL[c.ras.topBandBefore]]] }; },
  },
  'ras-netpay': {
    title: 'Relief at source or net pay, on a low salary', cta: 'Compare all three methods', ctaPage: 'relief-at-source-vs-net-pay',
    inputs: [salary(11500), money('gross', 'Total reaching the pension a year, tax top-up included', 600, 'If you pay £80, put £100')],
    run: (v) => { const c = compareMethods(v.salary, v.gross);
      return { head: ['Relief at source costs you', m(c.ras.netCost)], rows: [['Net pay costs you at the time', m(c.netpay.netCost + c.netpay.hmrcTopUp)], ['HMRC top-up the year after (net pay)', m(c.netpay.hmrcTopUp)], ['Net pay cost once topped up', m(c.netpay.netCost)], ['Income Tax saved by net pay', m(c.netpay.incomeTaxSaved)]],
        note: c.netpay.hmrcTopUp > 0 ? 'The net pay top-up is paid by HMRC after the tax year ends, to people whose income was below the Personal Allowance.' : undefined }; },
  },
  claim: {
    title: 'The higher rate relief to claim back', cta: 'See the whole relief by method', ctaPage: 'home',
    inputs: [salary(60000, 'Salary and other taxable income, before pension payments'), money('paid', 'You pay into a private pension or SIPP from your bank', 3000, 'This tax year, before the provider’s top-up'), nationIn],
    run: (v) => { const r = relief({ salary: v.salary, nation: nation(v.nation), method: 'ras', amount: v.paid });
      return { head: ['Extra you must claim yourself from HMRC (the tax office)', m(r.claim)], assume: `For one tax year, ${P.taxYear} · salary ${m(v.salary)} · you pay ${m(v.paid)} from your bank · ${nation(v.nation) === 'scotland' ? 'Scotland' : 'England, Wales or N. Ireland'}`, rows: [['Goes into your pension (what you pay plus the provider’s top-up)', m(r.gross)], ['Added by your provider (the basic 20%)', m(r.providerTopUp)], ['What it really costs you, once claimed', m(r.netCost)]],
        note: r.claim === 0 ? 'Nothing to claim: all of your income is taxed at the basic rate (20%), or below the Scottish 21% rate.' : `Your provider has already added ${m(r.providerTopUp)}: the basic 20%. You claim another ${m(r.claim)} yourself: that is the higher-rate part. The steps are just below.` }; },
  },
  scot: {
    title: 'Scottish relief against the rest of the UK', cta: 'Open the Scottish relief guide', ctaPage: 'scottish-pension-tax-relief',
    inputs: [salary(45000), money('paid', 'You pay into a relief at source pension', 2400, 'A year, from your bank')],
    run: (v) => { const s = relief({ salary: v.salary, nation: 'scotland', method: 'ras', amount: v.paid }), u = relief({ salary: v.salary, method: 'ras', amount: v.paid });
      return { head: ['To claim in Scotland', m(s.claim)], rows: [['To claim elsewhere in the UK', m(u.claim)], ['Scottish band', BAND_LABEL[s.topBandBefore]], ['Real cost in Scotland', m(s.netCost)], ['Real cost elsewhere', m(u.netCost)]] }; },
  },
  trap: {
    title: 'Win back the tax-free Personal Allowance above £100,000', cta: 'Plan contributions over £100,000', ctaPage: 'pension-contributions-over-100k',
    inputs: [salary(115000, 'Adjusted net income before the contribution'), nationIn],
    run: (v) => { const g = contributionToReach100k(v.salary); const r = relief({ salary: v.salary, nation: nation(v.nation), method: 'netpay', amount: g });
      return { head: ['Gross contribution to reach £100,000', m(g)], rows: [['Income Tax saved', m(r.incomeTaxSaved)], ['Personal Allowance won back', m(r.paAfter - r.paBefore)], ['Relief on the contribution', pc(r.effectiveRate)], ['Paid from a relief at source pension', m(g * 0.8)]] }; },
  },
  mpaa: {
    title: 'Saving again after taking flexible income', cta: 'Check your full annual allowance', ctaPage: 'annual-allowance-calculator',
    inputs: [salary(48000, 'Taxable income this year'), money('own', 'Your contributions, gross', 9000, 'Relief at source: what you pay plus 25%'), money('employer', 'Employer contributions', 4000)],
    run: (v) => { const a = annualAllowance({ income: v.salary, own: v.own, method: 'ras', employer: v.employer, flexiblyAccessed: true });
      return { head: ['Above the £10,000 limit after taking pension money (MPAA)', m(a.mpaaExcess)], rows: [['Total money purchase savings', m(a.savings)], ['Annual allowance charge', m(a.charge)], ['Charge without flexible access', m(annualAllowance({ income: v.salary, own: v.own, method: 'ras', employer: v.employer }).charge)]] }; },
  },
  cap2029: {
    title: 'Salary sacrifice before and after April 2029', cta: 'Open the salary sacrifice calculator', ctaPage: 'salary-sacrifice-calculator',
    inputs: [salary(60000), money('amount', 'Salary sacrificed a year', 6000)],
    run: (v) => { const a = relief({ salary: v.salary, method: 'sacrifice', amount: v.amount }), b = relief({ salary: v.salary, method: 'sacrifice', amount: v.amount, after2029: true });
      return { head: ['Extra cost a year from April 2029', m(b.netCost - a.netCost)], rows: [['Your NI saved now', m(a.niSaved)], ['Your NI saved from April 2029', m(b.niSaved)], ['Employer NI saved now', m(a.employerNiSaved)], ['Employer NI saved from April 2029', m(b.employerNiSaved)]] }; },
  },
  hicbc: {
    title: 'Pension contributions and the Child Benefit charge', cta: 'Read the Child Benefit guide', ctaPage: 'salary-sacrifice-child-benefit',
    inputs: [salary(72000, 'Adjusted net income before the contribution'), { id: 'kids', label: 'Children getting Child Benefit', def: 2, max: 10, decimals: 0 }, money('gross', 'Gross pension contribution or sacrifice', 8000)],
    run: (v) => { const before = hicbc(v.salary, v.kids), after = hicbc(v.salary - v.gross, v.kids);
      const tax = incomeTax(v.salary).tax - incomeTax(v.salary - v.gross).tax;
      return { head: ['Child Benefit charge saved', m(before - after)], rows: [['Child Benefit a year', m(childBenefitYear(v.kids))], ['Charge before', m(before)], ['Charge after', m(after)], ['Income Tax relief as well', m(tax)], ['Help on the contribution', pc(v.gross > 0 ? (before - after + tax) / v.gross : 0)]] }; },
  },
  'bik-years': {
    title: 'Company car tax on an electric car, year by year', cta: 'Price a car through salary sacrifice', ctaPage: 'salary-sacrifice-car-calculator',
    inputs: [money('price', 'List price', 45000, undefined, 1_000_000), salary(55000)],
    run: (v) => { const rows = CAR_YEARS.map((y): [string, string] => { const c = sacrificeCar({ salary: v.salary, monthly: 0, listPrice: v.price, year: y as CarYear, kind: 'zero' }); return [`${y} at ${pc(appropriatePercentage(y as CarYear, 'zero'))}`, `${m(c.bikTax)} a year`]; });
      const now = sacrificeCar({ salary: v.salary, monthly: 0, listPrice: v.price, year: '2026/27', kind: 'zero' });
      return { head: ['Car tax this year', `${m(now.bikTax)}`], rows: rows.slice(1) }; },
  },
  'relief-limit': {
    title: 'The most you can pay in with tax relief', cta: 'Open the SIPP calculator', ctaPage: 'sipp-calculator',
    inputs: [salary(30000, 'Your salary or self-employed profits this year')],
    run: (v) => { const g = Math.max(v.salary, P.relief.basicAmount);
      return { head: ['Most that can reach your pensions with relief', m(g)], rows: [['Paid from your bank (relief at source)', m(g * 0.8)], ['Yearly limit on all pension savings (annual allowance)', m(P.allowances.years['2026/27'].aa)], ['Limit for someone with no earnings', m(P.relief.basicAmount)]], note: `Relief follows your earnings, with ${m(P.relief.basicAmount)} for everyone, even with no earnings. Rent, dividends and interest do not count.` }; },
  },
};

export function getSpec(id: string): MiniSpec {
  const s = SPECS[id];
  if (!s) throw new Error(`Unknown mini spec: ${id}`);
  return s;
}
export const SPEC_IDS = Object.keys(SPECS);
