/**
 * Engine tests. Official cases first (GOV.UK and HMRC worked examples, published rates), then bounds
 * (taper edges, Personal Allowance taper, relief limit, MPAA, carry forward order). RECETTE §4, §17.4.
 */
import { describe, it, expect } from 'vitest';
import { incomeTax, employeeNI, employerNI, personalAllowance } from '../src/lib/engine/tax';
import { relief, compareMethods } from '../src/lib/engine/relief';
import { taperedAllowance, annualAllowance, carryForward } from '../src/lib/engine/allowance';
import { appropriatePercentage, sacrificeCar } from '../src/lib/engine/car';
import { projectPot, levelIncome, drawdown, fullStatePension } from '../src/lib/engine/forecast';

const close = (a: number, b: number, eps = 0.01) => expect(Math.abs(a - b)).toBeLessThanOrEqual(eps);

describe('income tax 2026/27', () => {
  it('rest of UK: £50,270 pays £7,540 (basic rate band of £37,700 at 20 %)', () => close(incomeTax(50270).tax, 7540));
  it('rest of UK: higher and additional rates', () => {
    close(incomeTax(60000).tax, 7540 + (60000 - 50270) * 0.4);
    close(incomeTax(150000).tax, 37700 * 0.2 + (125140 - 37700) * 0.4 + (150000 - 125140) * 0.45);
  });
  it('Scotland: six bands on taxable income (HMRC rates and thresholds for employers 2026 to 2027)', () => {
    // 50,000: taxable 37,430 = 3,967 at 19 % + 12,989 at 20 % + 14,136 at 21 % + 6,338 at 42 %.
    close(incomeTax(50000, 'scotland').tax, 3967 * 0.19 + 12989 * 0.2 + 14136 * 0.21 + 6338 * 0.42);
    // GOV.UK income bands: higher rate starts at £43,663 and advanced at £75,001 with a full allowance.
    expect(incomeTax(43662, 'scotland').topBand).toBe('intermediate');
    expect(incomeTax(43664, 'scotland').topBand).toBe('higher');
    expect(incomeTax(75002, 'scotland').topBand).toBe('advanced');
    expect(incomeTax(126000, 'scotland').topBand).toBe('top');
  });
  it('Personal Allowance: £1 less for every £2 above £100,000, nil at £125,140', () => {
    expect(personalAllowance(100000)).toBe(12570);
    expect(personalAllowance(110000)).toBe(7570);
    expect(personalAllowance(125140)).toBe(0);
    expect(personalAllowance(125139)).toBe(1);
  });
});

describe('National Insurance 2026/27', () => {
  it('employee: 8 % between £12,570 and £50,270, 2 % above', () => {
    close(employeeNI(30000), 17430 * 0.08);
    close(employeeNI(60000), 37700 * 0.08 + 9730 * 0.02);
    expect(employeeNI(12000)).toBe(0);
  });
  it('employer: 15 % above £5,000', () => close(employerNI(30000), 25000 * 0.15));
});

describe('relief at source (GOV.UK, Tax on your private pension contributions)', () => {
  it('GOV.UK example: £60,270 of earnings, £12,000 in a relief at source scheme: extra 20 % on £10,000 only', () => {
    const r = relief({ salary: 60270, method: 'ras', amount: 9600 });
    close(r.gross, 12000); close(r.providerTopUp, 2400); close(r.claim, 2000);
  });
  it('Scotland: extra relief of 1 %, 22 %, 25 % and 28 % (GOV.UK)', () => {
    close(relief({ salary: 35000, nation: 'scotland', method: 'ras', amount: 800 }).claim, 10);
    close(relief({ salary: 60000, nation: 'scotland', method: 'ras', amount: 800 }).claim, 220);
    close(relief({ salary: 90000, nation: 'scotland', method: 'ras', amount: 800 }).claim, 250);
    close(relief({ salary: 200000, nation: 'scotland', method: 'ras', amount: 800 }).claim, 280);
  });
  it('Scottish starter rate taxpayer keeps the full 20 % and owes nothing back', () => {
    const r = relief({ salary: 15000, nation: 'scotland', method: 'ras', amount: 800 });
    close(r.providerTopUp, 200); expect(r.claim).toBe(0);
  });
  it('additional rate (rest of UK): 25 % extra', () => close(relief({ salary: 200000, method: 'ras', amount: 800 }).claim, 250));
  it('basic rate taxpayer: nothing to claim', () => expect(relief({ salary: 40000, method: 'ras', amount: 2000 }).claim).toBe(0));
  it('non-taxpayer: £2,880 becomes £3,600 (Finance Act 2004 s.190 basic amount)', () => {
    const r = relief({ salary: 0, method: 'ras', amount: 2880 });
    close(r.gross, 3600); expect(r.overLimit).toBe(0);
    const r2 = relief({ salary: 0, method: 'ras', amount: 4000 });
    expect(r2.overLimit).toBeGreaterThan(0); close(r2.providerTopUp, 720);
  });
  it('£110,000: a £10,000 gross contribution earns 60 % relief (allowance restored)', () => {
    const r = relief({ salary: 110000, method: 'ras', amount: 8000 });
    close(r.claim, 4000); close(r.effectiveRate, 0.6, 0.0001); expect(r.paAfter).toBe(12570);
  });
});

describe('net pay and salary sacrifice', () => {
  it('net pay: same income tax saving as relief at source for a higher rate taxpayer', () => {
    const c = compareMethods(60000, 5000);
    close(c.netpay.netCost, c.ras.netCost);
  });
  it('net pay below the Personal Allowance: no tax saved, HMRC top-up of 20 % since 2024/25', () => {
    const r = relief({ salary: 11000, method: 'netpay', amount: 1000 });
    expect(r.incomeTaxSaved).toBe(0); close(r.hmrcTopUp, 200);
  });
  it('salary sacrifice adds employee NI: 8 % for a basic rate taxpayer', () => {
    const r = relief({ salary: 35000, method: 'sacrifice', amount: 3000 });
    close(r.incomeTaxSaved, 600); close(r.niSaved, 240); close(r.employerNiSaved, 450); close(r.netCost, 2160);
  });
  it('April 2029: NI exemption capped at £2,000 a year', () => {
    const a = relief({ salary: 60000, method: 'sacrifice', amount: 8000 });
    const b = relief({ salary: 60000, method: 'sacrifice', amount: 8000, after2029: true });
    close(a.niSaved, 160); close(b.niSaved, 40); close(b.employerNiSaved, 300); expect(b.capApplied).toBe(true);
    close(a.incomeTaxSaved, b.incomeTaxSaved);
  });
});

describe('annual allowance (HMRC pension schemes rates)', () => {
  it('taper: £60,000 cut by £1 per £2 above £260,000, floor £10,000, only if threshold income > £200,000', () => {
    expect(taperedAllowance('2026/27', 250000, 300000).aa).toBe(40000);
    expect(taperedAllowance('2026/27', 250000, 360000).aa).toBe(10000);
    expect(taperedAllowance('2026/27', 200000, 400000).aa).toBe(60000);
    expect(taperedAllowance('2022/23', 210000, 260000).aa).toBe(30000);
    expect(taperedAllowance('2022/23', 210000, 400000).aa).toBe(4000);
  });
  it('salary sacrifice is added back to threshold income', () => {
    const a = annualAllowance({ income: 230000, own: 40000, method: 'sacrifice', employer: 20000 });
    expect(a.thresholdIncome).toBe(230000); expect(a.adjustedIncome).toBe(250000); expect(a.aa).toBe(60000);
    const b = annualAllowance({ income: 230000, own: 40000, method: 'ras', employer: 20000 });
    expect(b.thresholdIncome).toBe(190000);
  });
  it('excess taxed at the marginal rate', () => {
    const a = annualAllowance({ income: 120000, own: 50000, method: 'netpay', employer: 20000 });
    expect(a.excess).toBe(10000); close(a.charge, 4000, 1);
  });
  it('MPAA: £10,000 for money purchase savings after flexible access, carry forward does not help', () => {
    const a = annualAllowance({ income: 50000, own: 12000, method: 'ras', employer: 3000, flexiblyAccessed: true, carryForward: 50000 });
    expect(a.mpaaExcess).toBe(5000); expect(a.chargeable).toBe(5000);
  });
});

describe('carry forward (Finance Act 2004 s.228A)', () => {
  it('current year first, then the earliest year', () => {
    const r = carryForward([{ year: '2023/24', savings: 20000, member: true }, { year: '2024/25', savings: 30000, member: true }, { year: '2025/26', savings: 60000, member: true }], 100000);
    expect(r.available).toBe(130000); expect(r.excess).toBe(0);
    expect(r.rows[0].used).toBe(40000); expect(r.rows[1].used).toBe(0); expect(r.carryIntoNext).toBe(30000);
  });
  it('no carry forward from a year without scheme membership', () => {
    const r = carryForward([{ year: '2023/24', savings: 0, member: false }, { year: '2024/25', savings: 0, member: true }, { year: '2025/26', savings: 0, member: true }], 150000);
    expect(r.available).toBe(180000);
  });
});

describe('company cars (ITEPA 2003 s.139, FA 2023 s.11, FA 2025 ss.5-6)', () => {
  it('appropriate percentages by year', () => {
    expect(appropriatePercentage('2026/27', 'zero')).toBe(0.04);
    expect(appropriatePercentage('2027/28', 'zero')).toBe(0.05);
    expect(appropriatePercentage('2028/29', 'zero')).toBe(0.07);
    expect(appropriatePercentage('2029/30', 'zero')).toBe(0.09);
    expect(appropriatePercentage('2026/27', 'hybrid', 80)).toBe(0.07);
    expect(appropriatePercentage('2026/27', 'hybrid', 129.2)).toBe(0.04);
    expect(appropriatePercentage('2027/28', 'hybrid', 35)).toBe(0.15);
    expect(appropriatePercentage('2028/29', 'hybrid', 200)).toBe(0.18);
  });
  it('electric car through salary sacrifice, higher rate taxpayer', () => {
    const c = sacrificeCar({ salary: 60000, monthly: 500, listPrice: 40000, year: '2026/27', kind: 'zero' });
    expect(c.bik).toBe(1600); close(c.bikTax, 640); close(c.taxSaved, 2400); close(c.niSaved, 120);
    close(c.netMonthly, (6000 - 2400 - 120 + 640) / 12);
  });
});

describe('projection and drawdown', () => {
  it('no growth, no inflation: the pot is the sum paid', () => {
    const p = projectPot({ age: 40, retireAge: 41, pot: 1000, monthly: 100, growth: 0, charges: 0, inflation: 0 });
    close(p.pot, 2200);
  });
  it('level income at zero real return spreads the pot evenly', () => close(levelIncome(300000, 65, 95, 0), 10000));
  it('drawdown at zero real return lasts pot ÷ withdrawal years', () => expect(drawdown({ pot: 100000, withdrawal: 10000, growth: 0, charges: 0, inflation: 0, startAge: 60 }).years).toBe(10));
  it('full new State Pension: £241.30 a week', () => close(fullStatePension(), 12547.6));
});

describe('High Income Child Benefit Charge (GOV.UK, from 2024/25)', () => {
  it('1 % per £200 above £60,000, the whole benefit at £80,000', async () => {
    const { hicbc, childBenefitYear } = await import('../src/lib/engine/relief');
    close(childBenefitYear(1), 1406.6); close(childBenefitYear(2), 1406.6 + 930.8);
    expect(hicbc(60000, 2)).toBe(0);
    expect(hicbc(70000, 2)).toBe(Math.floor(childBenefitYear(2) * 0.5));
    expect(hicbc(80000, 2)).toBe(Math.floor(childBenefitYear(2)));
    expect(hicbc(90000, 1)).toBe(Math.floor(childBenefitYear(1)));
  });
});
