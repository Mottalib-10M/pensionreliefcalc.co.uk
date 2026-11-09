/**
 * Annual allowance, taper, money purchase annual allowance and carry forward (P.allowances), following
 * HMRC's own steps: "Work out your reduced (tapered) annual allowance", "Check if you have unused annual
 * allowances", "Check if you've gone above the money purchase annual allowance", and Finance Act 2004 s.228A.
 * Defined contribution savings only: for a defined benefit scheme the pension input amount (closing value
 * minus opening value) is entered as an employer contribution.
 */
import { P, type AllowanceYear } from './params';
import { incomeTax, type Nation } from './tax';
import type { Method } from './relief';

const Y = P.allowances.years;
export const CURRENT: AllowanceYear = P.allowances.current as AllowanceYear;
export const PREVIOUS_THREE: AllowanceYear[] = ['2023/24', '2024/25', '2025/26'];

/** Tapered annual allowance for a year: £1 less for every £2 of adjusted income above the limit. */
export function taperedAllowance(year: AllowanceYear, thresholdIncome: number, adjustedIncome: number) {
  const y = Y[year];
  if (thresholdIncome <= y.threshold || adjustedIncome <= y.adjusted) return { aa: y.aa, reduction: 0, tapered: false };
  const reduction = Math.floor((adjustedIncome - y.adjusted) / 2);
  const aa = Math.max(y.minTaper, y.aa - reduction);
  return { aa, reduction: y.aa - aa, tapered: true };
}

export interface AAIn {
  /** All taxable income for the year before any pension contribution (salary before sacrifice, bonus, rent, profits). */
  income: number;
  /** Your own contribution, gross (for relief at source: what you pay plus the 20%). */
  own: number;
  method: Method;
  /** Employer contributions on top of anything you sacrificed (for a DB scheme, the pension input amount). */
  employer: number;
  /** You have taken flexible income or a UFPLS from a pension: the MPAA applies. */
  flexiblyAccessed?: boolean;
  /** Unused allowance brought forward from the three previous years. */
  carryForward?: number;
  nation?: Nation;
}

export interface AAOut {
  thresholdIncome: number; adjustedIncome: number;
  aa: number; standard: number; tapered: boolean; reduction: number;
  savings: number; available: number; excess: number;
  mpaa: number | null; mpaaExcess: number;
  chargeable: number; charge: number; chargeRate: number;
  unusedThisYear: number;
}

export function annualAllowance(i: AAIn, year: AllowanceYear = CURRENT): AAOut {
  const nation = i.nation ?? 'ruk';
  const income = Math.max(0, i.income), own = Math.max(0, i.own), employer = Math.max(0, i.employer);
  // HMRC steps. Threshold income: net income minus relief-at-source contributions, plus salary given up
  // through sacrifice (arrangements after 8 July 2015). Adjusted income: net income plus net pay
  // contributions plus all employer contributions (sacrificed salary included).
  const thresholdIncome = i.method === 'sacrifice' ? income : income - own;
  const adjustedIncome = income + employer;
  const t = taperedAllowance(year, thresholdIncome, adjustedIncome);
  const savings = own + employer;
  const cf = Math.max(0, i.carryForward ?? 0);
  const available = t.aa + cf;
  const excess = Math.max(0, savings - available);
  const mpaaValue = Y[year].mpaa;
  let mpaaExcess = 0, mpaa: number | null = null;
  if (i.flexiblyAccessed && mpaaValue !== null) {
    mpaa = mpaaValue;
    // All savings are money purchase here: the alternative chargeable amount is the excess over the MPAA
    // (carry forward cannot be used against it); the charge is on the higher of the two amounts.
    mpaaExcess = Math.max(0, savings - mpaaValue);
  }
  const chargeable = Math.max(excess, mpaaExcess);
  // The excess is added to taxable income and taxed at your rates.
  const taxable = i.method === 'ras' ? income : income - own;
  const ext = i.method === 'ras' ? own : 0;
  const charge = chargeable > 0 ? incomeTax(taxable + chargeable, nation, ext).tax - incomeTax(taxable, nation, ext).tax : 0;
  return { thresholdIncome, adjustedIncome, aa: t.aa, standard: Y[year].aa, tapered: t.tapered, reduction: t.reduction, savings, available, excess, mpaa, mpaaExcess, chargeable, charge, chargeRate: chargeable > 0 ? charge / chargeable : 0, unusedThisYear: Math.max(0, t.aa - savings) };
}

export interface CFYear { year: AllowanceYear; savings: number; allowance?: number; member: boolean }
export interface CFOut {
  rows: Array<{ year: AllowanceYear; allowance: number; savings: number; unused: number; used: number; left: number; member: boolean }>;
  current: { allowance: number; savings: number; fromCurrent: number };
  available: number; excess: number;
  /** Unused allowance you could still carry into next year (2024/25, 2025/26 and this year). */
  carryIntoNext: number;
}

/**
 * Carry forward (s.228A): this year's allowance is used first, then unused allowance from the earliest of
 * the three previous years. A year counts only if you were a member of a registered scheme in it.
 */
export function carryForward(prev: CFYear[], currentSavings: number, currentAllowance: number = Y[CURRENT].aa): CFOut {
  const fromCurrent = Math.min(currentSavings, currentAllowance);
  let need = Math.max(0, currentSavings - currentAllowance);
  const rows = [...prev].sort((a, b) => a.year.localeCompare(b.year)).map((p) => {
    const allowance = p.allowance ?? Y[p.year].aa;
    const unused = p.member ? Math.max(0, allowance - p.savings) : 0;
    const used = Math.min(unused, need); need -= used;
    return { year: p.year, allowance, savings: p.savings, unused, used, left: unused - used, member: p.member };
  });
  const available = currentAllowance + rows.reduce((s, r) => s + r.unused, 0);
  const excess = Math.max(0, currentSavings - available);
  // Next year the earliest of the three drops out.
  const carryIntoNext = rows.slice(1).reduce((s, r) => s + r.left, 0) + Math.max(0, currentAllowance - currentSavings);
  return { rows, current: { allowance: currentAllowance, savings: currentSavings, fromCurrent }, available, excess, carryIntoNext };
}
