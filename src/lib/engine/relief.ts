/**
 * Tax relief on a personal pension contribution, 2026/27, by the method the scheme uses.
 *
 * - `ras` (relief at source: personal pensions, SIPPs, some workplace schemes): you pay `amount` from
 *   taxed pay; the provider claims 20% and adds it (gross = amount / 0.8); anything above 20% is claimed
 *   through Self Assessment or HMRC's online service, and comes from widening the bands (tax.ts).
 * - `netpay`: the employer deducts `amount` from pay before Income Tax. No relief below the Personal
 *   Allowance, except HMRC's top-up for low earners since 2024/25 (Finance Act 2004 s.193A), paid later.
 * - `sacrifice`: salary is reduced by `amount` and the employer pays it in. Income Tax and employee NI are
 *   saved; the employer saves its own NI and may pass some of it on. From 6 April 2029 only the first
 *   £2,000 a year keeps the NI exemption (gov.uk, Changes to salary sacrifice for pensions from April 2029).
 * Relief is limited to 100% of relevant UK earnings or £3,600 gross (Finance Act 2004 s.190).
 */
import { P } from './params';
import { incomeTax, employeeNI, employerNI, type Nation } from './tax';

export type Method = 'ras' | 'netpay' | 'sacrifice';
export const METHOD_LABEL: Record<Method, string> = { ras: 'Relief at source (SIPP, personal pension)', netpay: 'Net pay (taken before tax)', sacrifice: 'Salary sacrifice' };

export interface ReliefIn {
  salary: number; otherIncome?: number; nation?: Nation; method: Method;
  /** ras: what you pay from your bank; netpay: what payroll deducts; sacrifice: salary given up. Per year. */
  amount: number;
  /** Share of the employer's NI saving the employer adds to the pension (0 to 1), salary sacrifice only. */
  employerNiShare?: number;
  /** Apply the April 2029 £2,000 cap on the NI exemption (salary sacrifice only). */
  after2029?: boolean;
}

export interface ReliefOut {
  method: Method;
  /** Amount reaching the pension because of your contribution (employer NI share included for sacrifice). */
  gross: number;
  /** Part of gross on which relief is due (Finance Act 2004 s.190 limit). */
  relievable: number;
  overLimit: number;
  providerTopUp: number;
  /** Extra relief claimed from HMRC (Self Assessment or online claim), relief at source only. */
  claim: number;
  incomeTaxSaved: number;
  niSaved: number;
  employerNiSaved: number;
  employerNiPassed: number;
  /** HMRC top-up for net pay savers with no taxable income (paid the following year). */
  hmrcTopUp: number;
  /** What the contribution costs your take-home pay once all relief has come back. */
  netCost: number;
  /** Total government help: (gross minus net cost) over gross. */
  effectiveRate: number;
  paBefore: number; paAfter: number;
  taxBefore: number; taxAfter: number;
  topBandBefore: string;
  limit: number;
  capApplied: boolean;
}

export function reliefLimit(earnings: number): number { return Math.max(earnings, P.relief.basicAmount); }

export function relief(i: ReliefIn): ReliefOut {
  const nation = i.nation ?? 'ruk';
  const salary = Math.max(0, i.salary), other = Math.max(0, i.otherIncome ?? 0), amt = Math.max(0, i.amount);
  const total = salary + other;
  const before = incomeTax(total, nation);
  const limit = reliefLimit(salary);
  const base = { method: i.method, paBefore: before.pa, taxBefore: before.tax, topBandBefore: before.topBand, limit, providerTopUp: 0, claim: 0, incomeTaxSaved: 0, niSaved: 0, employerNiSaved: 0, employerNiPassed: 0, hmrcTopUp: 0, capApplied: false };

  if (i.method === 'ras') {
    const gross = amt / (1 - P.relief.rasRate);
    const relievable = Math.min(gross, limit);
    const after = incomeTax(total, nation, relievable);
    const claim = Math.max(0, before.tax - after.tax);
    const providerTopUp = relievable * P.relief.rasRate;
    // You pay `amt`; if you pay more than the limit allows, the provider's 20% on the excess is due back.
    const grossIn = amt + providerTopUp;
    const netCost = amt - claim;
    return { ...base, gross: grossIn, relievable, overLimit: Math.max(0, gross - limit), providerTopUp, claim, netCost, effectiveRate: grossIn > 0 ? (grossIn - netCost) / grossIn : 0, paAfter: after.pa, taxAfter: after.tax };
  }

  if (i.method === 'netpay') {
    const relievable = Math.min(amt, limit);
    const after = incomeTax(total - relievable, nation);
    const saved = before.tax - after.tax;
    const hmrcTopUp = after.tax === 0 ? Math.max(0, relievable * P.relief.rasRate - saved) : 0;
    const netCost = amt - saved - hmrcTopUp;
    return { ...base, gross: amt, relievable, overLimit: Math.max(0, amt - limit), incomeTaxSaved: saved, hmrcTopUp, netCost, effectiveRate: amt > 0 ? (amt - netCost) / amt : 0, paAfter: after.pa, taxAfter: after.tax };
  }

  // Salary sacrifice.
  const s = Math.min(amt, salary);
  const niExempt = i.after2029 ? Math.min(s, P.sacrifice.niCap) : s;
  const after = incomeTax(total - s, nation);
  const taxSaved = before.tax - after.tax;
  const niSaved = employeeNI(salary) - employeeNI(salary - niExempt);
  const erSaved = employerNI(salary) - employerNI(salary - niExempt);
  const share = Math.min(1, Math.max(0, i.employerNiShare ?? 0));
  const passed = erSaved * share;
  const gross = s + passed;
  const netCost = s - taxSaved - niSaved;
  return { ...base, gross, relievable: s, overLimit: 0, incomeTaxSaved: taxSaved, niSaved, employerNiSaved: erSaved, employerNiPassed: passed, netCost, effectiveRate: gross > 0 ? (gross - netCost) / gross : 0, paAfter: after.pa, taxAfter: after.tax, capApplied: !!i.after2029 && s > P.sacrifice.niCap };
}

/** The three methods side by side for the same gross amount reaching the pension from your pay. */
export function compareMethods(salary: number, gross: number, nation: Nation = 'ruk', otherIncome = 0) {
  return {
    ras: relief({ salary, otherIncome, nation, method: 'ras', amount: gross * (1 - P.relief.rasRate) }),
    netpay: relief({ salary, otherIncome, nation, method: 'netpay', amount: gross }),
    sacrifice: relief({ salary, otherIncome, nation, method: 'sacrifice', amount: gross }),
    sacrifice2029: relief({ salary, otherIncome, nation, method: 'sacrifice', amount: gross, after2029: true }),
  };
}

/** Gross contribution that brings adjusted net income back to £100,000 (relief at source or net pay). */
export function contributionToReach100k(income: number): number { return Math.max(0, income - P.income.taperThreshold); }

/**
 * High Income Child Benefit Charge (ITEPA 2003 Part 10 Chapter 8 as amended from 2024/25; GOV.UK): 1% of the
 * Child Benefit for every £200 of adjusted net income above £60,000, all of it at £80,000. Gross pension
 * contributions by relief at source or net pay, and salary given up, lower adjusted net income.
 */
export function childBenefitYear(children: number): number {
  const n = Math.max(0, Math.round(children));
  if (n === 0) return 0;
  return Math.round((P.childBenefit.eldestWeekly + P.childBenefit.otherWeekly * (n - 1)) * 52 * 100) / 100;
}
export function hicbc(adjustedNetIncome: number, children: number): number {
  const cb = childBenefitYear(children), c = P.childBenefit;
  if (adjustedNetIncome <= c.hicbcFrom) return 0;
  const pct = Math.min(100, Math.floor((adjustedNetIncome - c.hicbcFrom) / c.hicbcStep));
  return Math.floor(cb * pct / 100);
}
