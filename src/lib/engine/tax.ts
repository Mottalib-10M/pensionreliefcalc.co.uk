/**
 * Income Tax and Class 1 National Insurance on earned income, 2026/27 (P.income, P.ni).
 *
 * - Personal Allowance tapered by £1 for every £2 of adjusted net income above £100,000 (ITA 2007 s.35).
 * - Bands are applied to taxable income (income minus the allowance), as in HMRC's tables.
 * - Relief at source and Gift Aid extend the band limits by the gross contribution and reduce adjusted
 *   net income by it. In Scotland every limit above the starter band is extended, which gives exactly the
 *   extra relief HMRC publishes: 1% at 21%, 22% at 42%, 25% at 45%, 28% at 48% (test in engine.test).
 * - Savings and dividend income are out of scope: the site deals with wages, profits and pensions.
 */
import { P } from './params';

export type Nation = 'ruk' | 'scotland';
export interface Band { name: string; rate: number; amount: number }
export interface TaxResult { pa: number; taxable: number; tax: number; parts: Band[]; topRate: number; topBand: string }

const BANDS = { ruk: P.income.ruk, scotland: P.income.scotland };

export function personalAllowance(adjustedNetIncome: number): number {
  const over = Math.max(0, adjustedNetIncome - P.income.taperThreshold);
  return Math.max(0, P.income.personalAllowance - Math.floor(over / 2));
}

/**
 * Tax on `income` (taxable total income, after net pay and salary sacrifice deductions).
 * `extension`: gross relief-at-source contributions (and Gift Aid) that widen the bands and lower adjusted net income.
 */
export function incomeTax(income: number, nation: Nation = 'ruk', extension = 0): TaxResult {
  const inc = Math.max(0, income);
  const ext = Math.max(0, extension);
  const pa = personalAllowance(inc - ext);
  const taxable = Math.max(0, inc - pa);
  const parts: Band[] = [];
  let lower = 0, tax = 0, topRate = 0, topBand = 'personal allowance';
  for (const b of BANDS[nation]) {
    const widened = nation === 'ruk' || b.name !== 'starter';
    const upper = b.upTo === null ? Infinity : b.upTo + (widened ? ext : 0);
    const amount = Math.max(0, Math.min(taxable, upper) - lower);
    if (amount > 0) { parts.push({ name: b.name, rate: b.rate, amount }); tax += amount * b.rate; topRate = b.rate; topBand = b.name; }
    lower = Math.max(lower, upper);
    if (taxable <= upper) break;
  }
  return { pa, taxable, tax, parts, topRate, topBand };
}

/** Employee (primary) Class 1 NI, category A, worked out on annual earnings. */
export function employeeNI(earnings: number): number {
  const N = P.ni; const e = Math.max(0, earnings);
  return Math.max(0, Math.min(e, N.upperEarningsLimit) - N.primaryThreshold) * N.mainRate + Math.max(0, e - N.upperEarningsLimit) * N.upperRate;
}

/** Employer (secondary) Class 1 NI, category A. */
export function employerNI(earnings: number): number {
  return Math.max(0, earnings - P.ni.secondaryThreshold) * P.ni.employerRate;
}

/** Marginal rate of income tax plus employee NI on the next £100 of pay (taper included). */
export function marginalRate(income: number, nation: Nation = 'ruk', withNI = true): number {
  const d = 100;
  const t = incomeTax(income + d, nation).tax - incomeTax(income, nation).tax;
  const n = withNI ? employeeNI(income + d) - employeeNI(income) : 0;
  return (t + n) / d;
}

export const BAND_LABEL: Record<string, string> = {
  basic: 'basic rate', higher: 'higher rate', additional: 'additional rate', starter: 'starter rate',
  intermediate: 'intermediate rate', advanced: 'advanced rate', top: 'top rate', 'personal allowance': 'no tax (Personal Allowance)',
};
