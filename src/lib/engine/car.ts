/**
 * Electric and plug-in hybrid cars through salary sacrifice (P.cars, P.sacrifice).
 * Cars with CO2 emissions of 75 g/km or less keep the normal benefit-in-kind rules under salary sacrifice
 * (HMRC, Salary sacrifice for employers): the taxable benefit is list price × appropriate percentage
 * (ITEPA 2003 s.139 as amended by FA 2023 s.11 and FA 2025 ss.5-6), whatever salary is given up.
 * Hybrids are 1 to 50 g/km here; their rate depends on electric range up to 2027/28, then is flat.
 */
import { P, type CarYear } from './params';
import { incomeTax, employeeNI, employerNI, type Nation } from './tax';

export type CarKind = 'zero' | 'hybrid';
export const CAR_YEARS = P.cars.years as CarYear[];

export function appropriatePercentage(year: CarYear, kind: CarKind, rangeMiles = 0): number {
  if (kind === 'zero') return P.cars.zero[year];
  const r = Math.ceil(Math.max(0, rangeMiles)); // s.139(2)(b): range rounded up
  const row = P.cars.hybrid[year].find((b) => r >= b.minRange)!;
  return row.rate;
}

export interface CarIn { salary: number; nation?: Nation; monthly: number; listPrice: number; year: CarYear; kind: CarKind; range?: number; otherIncome?: number }
export interface CarOut {
  rate: number; bik: number; bikTax: number;
  sacrificed: number; taxSaved: number; niSaved: number;
  netAnnual: number; netMonthly: number;
  /** Cost of the same payments taken from take-home pay. */
  fromNetMonthly: number; savingMonthly: number; savingShare: number;
  employerNiSaved: number; employerClass1A: number;
}

export function sacrificeCar(i: CarIn): CarOut {
  const nation = i.nation ?? 'ruk';
  const salary = Math.max(0, i.salary), other = Math.max(0, i.otherIncome ?? 0);
  const s = Math.min(Math.max(0, i.monthly) * 12, salary);
  const rate = appropriatePercentage(i.year, i.kind, i.range);
  const bik = Math.floor(Math.max(0, i.listPrice) * rate);
  const t0 = incomeTax(salary + other, nation).tax;
  const t1 = incomeTax(salary - s + other, nation).tax;
  const t2 = incomeTax(salary - s + other + bik, nation).tax;
  const taxSaved = t0 - t1, bikTax = t2 - t1;
  const niSaved = employeeNI(salary) - employeeNI(salary - s);
  const netAnnual = s - taxSaved - niSaved + bikTax;
  const fromNetMonthly = s / 12;
  const netMonthly = netAnnual / 12;
  return { rate, bik, bikTax, sacrificed: s, taxSaved, niSaved, netAnnual, netMonthly, fromNetMonthly, savingMonthly: fromNetMonthly - netMonthly, savingShare: fromNetMonthly > 0 ? 1 - netMonthly / fromNetMonthly : 0,
    employerNiSaved: employerNI(salary) - employerNI(salary - s), employerClass1A: bik * P.ni.class1A };
}
