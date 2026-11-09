/**
 * Pension pot projection and drawdown, in today's money. These are illustrations, not law: growth,
 * charges and inflation are assumptions typed by the visitor. The only statutory figure is the full
 * new State Pension (P.statePension, GOV.UK, 2026/27), shown at today's value.
 * Real return per year = (1 + growth - charges) / (1 + inflation) - 1. Contributions are monthly and
 * keep their value in today's money (they rise with inflation).
 */
import { P } from './params';

export const realRate = (growth: number, charges: number, inflation: number) => (1 + growth - charges) / (1 + inflation) - 1;
export const fullStatePension = () => Math.round(P.statePension.fullWeekly * 52 * 100) / 100;

export interface ProjectIn { age: number; retireAge: number; pot: number; monthly: number; growth: number; charges: number; inflation: number }
export function projectPot(i: ProjectIn) {
  const years = Math.max(0, Math.round(i.retireAge) - Math.round(i.age));
  const r = realRate(i.growth, i.charges, i.inflation);
  const rm = Math.pow(1 + r, 1 / 12) - 1;
  let pot = Math.max(0, i.pot), paid = 0;
  for (let k = 0; k < years * 12; k++) { pot = pot * (1 + rm) + Math.max(0, i.monthly); paid += Math.max(0, i.monthly); }
  return { years, pot, paid, growthPart: pot - Math.max(0, i.pot) - paid, realRate: r };
}

/** Level yearly income (today's money) that a pot pays from `fromAge` until `toAge`, paid at the start of each year. */
export function levelIncome(pot: number, fromAge: number, toAge: number, r: number): number {
  const n = Math.max(1, Math.round(toAge) - Math.round(fromAge));
  if (Math.abs(r) < 1e-9) return pot / n;
  const annuityDue = (1 - Math.pow(1 + r, -n)) / r * (1 + r);
  return pot / annuityDue;
}

/** Pot needed at `retireAge` for a target income until `toAge`, with the State Pension paying part of it from `spa`. */
export function potNeeded(target: number, retireAge: number, toAge: number, spa: number, statePension: number, r: number): number {
  let pv = 0;
  for (let a = Math.round(retireAge); a < Math.round(toAge); a++) {
    const need = Math.max(0, target - (a >= spa ? statePension : 0));
    pv += need / Math.pow(1 + r, a - retireAge);
  }
  return pv;
}

export interface DrawIn { pot: number; withdrawal: number; growth: number; charges: number; inflation: number; startAge: number }
/** Years a pot lasts with a yearly withdrawal that keeps its value (rises with inflation), taken at the start of each year. */
export function drawdown(i: DrawIn, maxYears = 60) {
  const r = realRate(i.growth, i.charges, i.inflation);
  let pot = Math.max(0, i.pot), years = 0, last = 0;
  const w = Math.max(0, i.withdrawal);
  const path: Array<{ age: number; start: number }> = [];
  while (years < maxYears) {
    path.push({ age: Math.round(i.startAge) + years, start: pot });
    if (pot <= 0 || w <= 0) break;
    if (pot < w) { last = pot; pot = 0; years += 1; break; }
    pot = (pot - w) * (1 + r); years += 1;
  }
  const lastsForever = w <= 0 || (pot > 0 && years >= maxYears);
  return { years, lastsForever, endAge: Math.round(i.startAge) + years, lastPayment: last, realRate: r, path, sustainable: Math.max(0, i.pot) * (r > 0 ? r / (1 + r) : 0) };
}
