/**
 * Full calculators of the tool pages (RECETTE §17). Each spec calls the tested engine of `lib/engine/`
 * and never computes tax itself. Select fields carry numbers (0, 1, 2…) so the state fits in the link.
 */
import type { ToolSpec, MiniInput } from './mini-types';
import { P, type CarYear, type AllowanceYear } from './engine/params';
import { relief, compareMethods, type Method } from './engine/relief';
import { BAND_LABEL, type Nation } from './engine/tax';
import { annualAllowance, carryForward, PREVIOUS_THREE, CURRENT } from './engine/allowance';
import { sacrificeCar, CAR_YEARS } from './engine/car';
import { projectPot, levelIncome, potNeeded, drawdown, fullStatePension } from './engine/forecast';
import { formatMoney, formatPercent } from './format';

const m = (n: number) => formatMoney(Math.round(n), 0);
const pc = (x: number, d = 0) => formatPercent(x, d);
const C1 = '#24476B', C2 = '#5f93c9', C3 = '#bad1e8', C4 = '#94a3b8';

export const NATION_OPTS = [{ value: '0', label: 'England, Wales or N. Ireland' }, { value: '1', label: 'Scotland' }];
export const nation = (v: number): Nation => (Math.round(v) === 1 ? 'scotland' : 'ruk');
// Options in payslip words, the method's name in brackets (naive testers 2026-11-09, second round: 3 out of 3
// could not tell "relief at source" from "net pay").
export const METHOD_OPTS = [{ value: '0', label: 'From my bank or after tax (private pension, SIPP)' }, { value: '1', label: 'Taken from my pay before tax (net pay)' }, { value: '2', label: 'My salary is reduced (salary sacrifice)' }];
/** Relief calculator only: a fourth answer for the reader who does not know, worked out as relief at source. */
export const METHOD_OPTS_UNSURE = [...METHOD_OPTS, { value: '3', label: 'I’m not sure: show the usual case' }];
export const method = (v: number): Method => (['ras', 'netpay', 'sacrifice', 'ras'] as Method[])[Math.min(3, Math.max(0, Math.round(v)))];
const YESNO = [{ value: '0', label: 'No' }, { value: '1', label: 'Yes' }];
const money = (id: string, label: string, def: number, help?: string, max = 10_000_000): MiniInput => ({ id, label, def, unit: '£', max, help });
const salary = (def: number, label = 'Salary before tax, a year', help = 'Before any pension deduction or sacrifice'): MiniInput => money('salary', label, def, help);
const pct = (id: string, label: string, def: number, max = 100, help?: string, advanced = true): MiniInput => ({ id, label, def, unit: '%', max, decimals: 2, help, advanced });
const nationIn = (advanced = false): MiniInput => ({ id: 'nation', label: 'Where you pay Income Tax', def: 0, options: NATION_OPTS, advanced, help: 'Usually where you live. Not sure? Your tax code starts with S in Scotland' });

const TOOLS: Record<string, ToolSpec> = {
  relief: {
    advancedLabel: 'Optional: other income, salary sacrifice extras',
    formNote: { text: 'Pension at work and not sure how it is paid?', link: 'The payslip test, in three lines', page: 'relief-at-source-vs-net-pay', anchor: 'which-one' },
    exemple: (v) => `Example for someone earning ${m(v.salary)} who pays ${m(v.amount)} a year into a pension: change any figure below`,
    action: { page: 'higher-rate-pension-tax-relief', anchor: 'how-to-claim' },
    inputs: [salary(45000, 'Salary before tax, a year', 'Self-employed? Use your profits. Not sure? Use your yearly pay before tax: it is on your P60 or contract'), money('amount', 'You pay in a year', 3000, 'What leaves your bank or your payslip, before any top-up. Paying monthly? Times 12: £250 a month is £3,000'),
      { id: 'method', label: 'How you pay into your pension', def: 3, options: METHOD_OPTS_UNSURE, help: 'Private pension or SIPP paid from your bank? Choose the first line. Not sure? Keep “I’m not sure”.' }, nationIn(),
      { id: 'flex', label: 'Taken money from a pension pot already?', def: 0, options: [{ value: '0', label: 'No, or only the tax-free cash' }, { value: '1', label: 'Yes, income or a taxable lump sum' }] },
      { ...money('other', 'Other taxable income a year', 0, 'Rent, a second job, a pension: not interest. None? Leave 0', 10_000_000), advanced: true }, { ...pct('share', 'Employer top-up from its NI (National Insurance) saving, sacrifice only', 0, 100, 'Most employers add nothing: leave 0'), decimals: 0 },
      { id: 'y2029', label: 'Salary sacrifice rules', def: 0, options: [{ value: '0', label: 'today’s (2026/27)' }, { value: '1', label: 'planned from 6 April 2029' }], advanced: true }],
    run: (v) => {
      const meth = method(v.method), n = nation(v.nation);
      const r = relief({ salary: v.salary, otherIncome: v.other, nation: n, method: meth, amount: v.amount, employerNiShare: v.share / 100, after2029: v.y2029 === 1 });
      const help = r.gross - r.netCost;
      const rows: Array<[string, string] | [string, string, 'total']> = [];
      if (meth === 'ras') {
        rows.push(['You pay', m(v.amount)], ['Added by your provider (£1 for every £4 you pay)', m(r.providerTopUp)], ['Extra you claim yourself from HMRC (the tax office)', m(r.claim)]);
      } else if (meth === 'netpay') {
        rows.push(['Taken from your pay before tax', m(r.gross)], ['Income Tax saved', m(r.incomeTaxSaved)]);
        if (r.hmrcTopUp > 0) rows.push(['HMRC top-up for low earners (next year)', m(r.hmrcTopUp)]);
      } else {
        rows.push(['Salary given up', m(r.relievable)], ['Income Tax saved', m(r.incomeTaxSaved)], ['National Insurance (NI) saved', m(r.niSaved)]);
        if (r.employerNiPassed > 0) rows.push(['Employer NI added to the pension', m(r.employerNiPassed)]);
      }
      if (r.paAfter > r.paBefore) rows.push(['Personal Allowance won back', m(r.paAfter - r.paBefore)]);
      rows.push(['What it really costs you', m(r.netCost), 'total']);
      const band = BAND_LABEL[r.topBandBefore];
      const sub = meth === 'ras'
        ? (r.claim > 0
          ? `Your provider adds ${m(r.providerTopUp)} by itself. You claim another ${m(r.claim)} from HMRC yourself: that is the higher-rate part.`
          : `Your provider adds ${m(r.providerTopUp)}: ${m(1)} for every ${m(4)} you pay. You pay tax at the ${band}${/^basic/.test(band) && n === 'ruk' ? ' (20%)' : ''}, so there is nothing more to claim.`)
        : meth === 'netpay'
          ? `The other ${m(help)} is Income Tax you no longer pay. Nothing to claim.`
          : `The other ${m(help)} is Income Tax and National Insurance (NI) you no longer pay. Nothing to claim.`;
      const methodWords = ['paid from your bank or after tax', 'taken from pay before tax', 'by salary sacrifice', 'usual case: paid from your bank'][Math.min(3, Math.max(0, Math.round(v.method)))];
      const assume = `For one tax year, ${P.taxYear} · salary ${m(v.salary)} · you pay ${m(v.amount)}, ${methodWords} · ${n === 'scotland' ? 'Scotland' : 'England, Wales or N. Ireland'}`;
      const notes: string[] = [];
      if (Math.round(v.method) === 3) notes.push('Set to “not sure”, so this shows a private pension or SIPP paid from your bank. A workplace pension taken before tax gives the same tax relief; salary sacrifice costs a little less. The payslip test tells them apart.');
      if (n === 'ruk') {
        const sc = relief({ salary: v.salary, otherIncome: v.other, nation: 'scotland', method: meth, amount: v.amount, employerNiShare: v.share / 100, after2029: v.y2029 === 1 });
        if (Math.round(sc.netCost) !== Math.round(r.netCost)) notes.push('Live in Scotland? Choose it above: your figures change.');
      }
      if (r.overLimit > 0) notes.push(`Relief stops at 100% of your earnings, or ${m(P.relief.basicAmount)} gross if that is higher: ${m(r.overLimit)} of this contribution gets no relief.`);
      if (meth === 'ras' && r.claim > 0) notes.push('Your provider never adds more than £1 for every £4. The rest comes back through your tax return or HMRC’s online claim, as a refund or a change to your tax code.');
      if (meth === 'netpay' && r.hmrcTopUp > 0) notes.push('Below the Personal Allowance net pay gives no relief at the time; HMRC has paid a 20% top-up to these savers since 2024/25, the year after.');
      if (r.gross > P.allowances.years[CURRENT].aa) notes.push(`More than ${m(P.allowances.years[CURRENT].aa)} a year with employer money counts against the annual allowance: check it on the annual allowance calculator.`);
      if (v.flex === 1) { const mp = P.allowances.years[CURRENT].mpaa!; notes.push(r.gross > mp ? `You have taken taxable pension income, so only ${m(mp)} a year can go into pension pots without a tax charge (the money purchase annual allowance). This payment puts ${m(r.gross)} in: check it on the annual allowance calculator.` : `You have taken taxable pension income: up to ${m(mp)} a year can still go into pension pots without a charge, so ${m(r.gross)} is fine.`); }
      if (r.capApplied) notes.push(`From 6 April 2029 only the first ${m(P.sacrifice.niCap)} of salary given up for a pension each year is free of NI; Income Tax relief is unchanged.`);
      return {
        head: ['Goes into your pension', m(r.gross)], assume, sub, rows, action: meth === 'ras' && r.claim > 0 ? `How to claim this ${m(r.claim)}, step by step` : undefined,
        bar: { segments: [{ label: 'From you', value: Math.max(0, r.netCost), color: C1 }, { label: 'Income Tax relief', value: r.providerTopUp + r.claim + r.incomeTaxSaved + r.hmrcTopUp, color: C2 }, { label: 'NI saved', value: r.niSaved + r.employerNiPassed, color: C3 }].filter((x) => x.value > 0.5), total: r.gross, aria: 'Who pays for the contribution' },
        notes, sticky: `${m(r.gross)} into your pension for ${m(r.netCost)} from you`,
      };
    },
    footnote: 'HMRC rates 2026 to 2027, rest of UK and Scotland. Savings and dividend income are not modelled.',
  },

  sacrifice: {
    advancedLabel: 'Optional: employer top-up, other income, comparison',
    exemple: (v) => `Example for someone earning ${m(v.salary)} who gives up ${m(v.amount)} a year: change any figure below`,
    inputs: [salary(45000), money('amount', 'Salary to give up a year', 3750, 'Your employer pays it into your pension instead. Not sure? Use the yearly amount in your scheme letter'), nationIn(), { id: 'share', label: 'Share of its own NI (National Insurance) saving your employer adds to your pension', def: 0, unit: '%', max: 100, decimals: 0, help: 'Most employers add nothing: leave 0. Ask HR if unsure.', advanced: true }, { ...money('other', 'Other taxable income a year', 0, 'Rent, a second job: leave 0 if none', 10_000_000), advanced: true }, { id: 'pad', label: 'Compare with', def: 0, options: [{ value: '0', label: 'Paying from your bank (relief at source)' }, { value: '1', label: 'Taken from pay before tax (net pay)' }], advanced: true }],
    run: (v) => {
      const n = nation(v.nation);
      const now = relief({ salary: v.salary, otherIncome: v.other, nation: n, method: 'sacrifice', amount: v.amount, employerNiShare: v.share / 100 });
      const later = relief({ salary: v.salary, otherIncome: v.other, nation: n, method: 'sacrifice', amount: v.amount, employerNiShare: v.share / 100, after2029: true });
      const alt = v.pad === 1 ? relief({ salary: v.salary, otherIncome: v.other, nation: n, method: 'netpay', amount: now.gross }) : relief({ salary: v.salary, otherIncome: v.other, nation: n, method: 'ras', amount: now.gross * 0.8 });
      const rows: Array<[string, string] | [string, string, 'total']> = [['Salary given up', m(now.relievable)], ['Income Tax saved', m(now.incomeTaxSaved)], ['Your National Insurance (NI) saved', m(now.niSaved)]];
      if (now.employerNiPassed > 0) rows.push(['Added by your employer from its NI saving', m(now.employerNiPassed)]);
      rows.push([`Same pension paid ${v.pad === 1 ? 'from pay before tax (net pay)' : 'from your bank (relief at source)'} would cost you`, m(alt.netCost)], ['You keep more with sacrifice, a year', m(alt.netCost - now.netCost), 'total']);
      return {
        head: ['Take-home pay falls by', m(now.netCost)], assume: `For one tax year, ${P.taxYear} · salary ${m(v.salary)} · ${m(v.amount)} given up · ${nation(v.nation) === 'scotland' ? 'Scotland' : 'England, Wales or N. Ireland'}`, sub: `About ${m(now.netCost / 12)} a month. ${m(now.gross)} reaches your pension.`,
        rows,
        bar: { segments: [{ label: 'From your pay', value: Math.max(0, now.netCost), color: C1 }, { label: 'Income Tax', value: now.incomeTaxSaved, color: C2 }, { label: 'Your NI', value: now.niSaved, color: C3 }, { label: 'Employer NI added', value: now.employerNiPassed, color: C4 }].filter((x) => x.value > 0.5), total: now.gross, aria: 'Who pays for the pension contribution' },
        notes: [later.capApplied ? `From 6 April 2029 (announced): only the first ${m(P.sacrifice.niCap)} you give up each year will be free of NI. You would pay NI again on the other ${m(Math.max(0, now.relievable - P.sacrifice.niCap))}, so take-home pay would fall by ${m(later.netCost)} instead of ${m(now.netCost)}.` : `From 6 April 2029 (announced) only the first ${m(P.sacrifice.niCap)} a year will be free of NI; ${m(now.relievable)} is within it, so nothing changes for you.`,
          now.employerNiSaved > 0 ? `Your employer also saves ${m(now.employerNiSaved)} of its own NI. It keeps it, unless it adds some to your pension (see “Optional” above).` : '',
          'Repaying a student loan? Giving up salary lowers your repayments too. The calculator leaves that out, so your real saving is larger.',
          ].filter(Boolean),
        sticky: `Take-home falls by ${m(now.netCost)} (${m(now.netCost / 12)} a month) for ${m(now.gross)} in your pension`,
      };
    },
    footnote: 'Employee and employer NI for most employees, 2026/27, worked out on the year. The April 2029 cap is government policy announced on 26 November 2025.',
  },

  car: {
    advancedLabel: 'More: Scotland, tax year, other income',
    inputs: [salary(55000), money('monthly', 'Salary sacrificed a month', 450, 'The gross amount in your scheme quote', 100_000), money('price', 'List price of the car (P11D)', 42000, 'Including options and VAT', 1_000_000),
      { id: 'kind', label: 'Car', def: 0, options: [{ value: '0', label: 'Fully electric (0 g/km)' }, { value: '1', label: 'Plug-in hybrid (1-50 g/km)' }] },
      { id: 'range', label: 'Electric range (hybrids)', def: 40, unit: 'mi', max: 1000, decimals: 0, help: 'Official figure on the certificate of conformity' }, { id: 'year', label: 'Tax year', def: 0, options: CAR_YEARS.map((y, k) => ({ value: String(k), label: y })), help: 'Each runs from 6 April to 5 April' },
      nationIn(true), money('other', 'Other taxable income a year', 0, 'Rent, a second job: leave 0 if none', 10_000_000)].map((x) => (x.id === 'other' ? { ...x, advanced: true } : x)),
    run: (v) => {
      const year = CAR_YEARS[Math.min(3, Math.max(0, Math.round(v.year)))] as CarYear;
      const c = sacrificeCar({ salary: v.salary, nation: nation(v.nation), monthly: v.monthly, listPrice: v.price, year, kind: v.kind === 1 ? 'hybrid' : 'zero', range: v.range, otherIncome: v.other });
      return {
        head: ['Real cost a month', m(c.netMonthly)], sub: `Against ${m(c.fromNetMonthly)} a month if the same payments came out of take-home pay: ${pc(c.savingShare)} less.`,
        rows: [['Salary sacrificed a month', m(c.sacrificed / 12)], ['Income Tax saved a month', m(c.taxSaved / 12)], ['NI saved a month', m(c.niSaved / 12)], [`Benefit in kind: ${pc(c.rate)} of list price`, `${m(c.bik)} a year`], ['Company car tax a month', m(c.bikTax / 12)], ['Saving against paying from net pay', `${m(c.savingMonthly)} a month`, 'total']],
        bar: { segments: [{ label: 'You pay', value: Math.max(0, c.netMonthly), color: C1 }, { label: 'Tax and NI saved, less car tax', value: Math.max(0, c.savingMonthly), color: C2 }], total: c.fromNetMonthly, aria: 'Monthly payment split' },
        notes: [`${year}: ${v.kind === 1 ? 'plug-in hybrid' : 'electric'} car at ${pc(c.rate)}. Your employer pays ${m(c.employerClass1A)} of Class 1A NI on the benefit and saves ${m(c.employerNiSaved)} of its own NI on the salary given up.`, 'Cars up to 75 g/km keep the normal benefit-in-kind rules under salary sacrifice. The £2,000 cap of April 2029 is about pensions, not cars.'],
        sticky: `${m(c.netMonthly)} a month real cost · ${m(c.savingMonthly)} saved against paying from net pay`,
      };
    },
    footnote: 'Appropriate percentages in ITEPA 2003 s.139 as amended by the Finance Acts 2023 and 2025. Charging and insurance are not included.',
  },

  aa: {
    advancedLabel: 'More: carry forward, Scotland',
    inputs: [money('income', 'Taxable income before pension contributions', 150000, 'Salary before sacrifice, bonus, profits, rent'), money('own', 'Your own contributions, gross', 30000, 'Relief at source: what you pay plus 25%'), { id: 'method', label: 'How you contribute', def: 1, options: METHOD_OPTS }, money('employer', 'Employer contributions on top', 15000, 'For a defined benefit scheme: the pension input amount'),
      { id: 'flex', label: 'Taken flexible income from a pension?', def: 0, options: YESNO, help: 'Drawdown income or a taxable lump sum lowers your limit to £10,000 (the money purchase annual allowance, MPAA)' }, nationIn(true), money('cf', 'Unused allowance from the last 3 years', 0, 'From the carry forward calculator', 1_000_000)].map((x) => (x.id === 'cf' ? { ...x, advanced: true } : x)),
    run: (v) => {
      const a = annualAllowance({ income: v.income, own: v.own, method: method(v.method), employer: v.employer, flexiblyAccessed: v.flex === 1, carryForward: v.cf, nation: nation(v.nation) });
      const rows: Array<[string, string] | [string, string, 'total']> = [['Threshold income', m(a.thresholdIncome)], ['Adjusted income', m(a.adjustedIncome)], ['Reduction by the taper', m(a.reduction)], ['Total pension savings this year', m(a.savings)], ['Allowance with carry forward', m(a.available)]];
      if (a.mpaa !== null) rows.push(['Money purchase annual allowance', m(a.mpaa)]);
      rows.push(['Above your allowance', m(a.chargeable)], ['Annual allowance charge', m(a.charge), 'total']);
      const notes: string[] = [];
      if (!a.tapered && a.adjustedIncome > P.allowances.years[CURRENT].adjusted) notes.push(`Adjusted income is above ${m(P.allowances.years[CURRENT].adjusted)} but threshold income is ${m(P.allowances.years[CURRENT].threshold)} or less, so the allowance is not tapered.`);
      if (a.tapered) notes.push(`Tapered: £1 less for every £2 of adjusted income above ${m(P.allowances.years[CURRENT].adjusted)}, never below ${m(P.allowances.years[CURRENT].minTaper)}.`);
      if (a.chargeable > 0) notes.push(`The excess is added to your income and taxed at your own rates (${pc(a.chargeRate, 1)} on average here). Above £2,000 of charge you can ask the scheme to pay it ("scheme pays").`);
      if (a.mpaa !== null) notes.push('After flexible access, money purchase savings above £10,000 are charged even when carry forward would cover them.');
      return { head: [a.mpaa !== null ? 'Allowance for money purchase savings' : 'Your annual allowance, 2026/27', m(a.mpaa ?? a.aa)], sub: a.chargeable > 0 ? `You are ${m(a.chargeable)} over: a charge of about ${m(a.charge)}.` : `You have ${m(Math.max(0, (a.mpaa ?? a.available) - a.savings))} of room left this year.`, rows, notes, sticky: `Allowance ${m(a.mpaa ?? a.aa)} · saved ${m(a.savings)} · charge ${m(a.charge)}` };
    },
    footnote: 'HMRC pension schemes rates and its taper steps for 2026/27. Defined contribution savings; enter a DB pension input amount as employer money.',
  },

  cf: {
    advancedLabel: 'Optional: lower yearly limits in earlier years (rare)',
    exemple: (v) => `Example for someone paying ${m(v.cur)} in this year after saving ${m(v.s2)} last year, ${m(v.s1)} the year before and ${m(v.s0)} three years ago: change any figure below`,
    inputs: [money('cur', 'Pension savings in 2026/27', 90000, 'Everything paid in by you and your employer, tax top-up included. Not sure? Your pension statement shows it'), money('s2', 'Pension savings in 2025/26', 30000, 'Same rule. Not sure? Ask your provider for the yearly statement', 1_000_000), money('s1', 'Pension savings in 2024/25', 25000, undefined, 1_000_000), money('s0', 'Pension savings in 2023/24', 10000, undefined, 1_000_000),
      { id: 'member', label: 'In a workplace or personal pension in each of those years?', def: 1, options: YESNO, help: 'Even with nothing paid in. The State Pension does not count' }, money('aaCur', 'Your yearly limit in 2026/27', 60000, `Only lower if your income is above ${m(P.allowances.years[CURRENT].threshold)}. Not sure? Leave it`, 1_000_000), money('a2', 'Your yearly limit in 2025/26', 60000, 'Same rule for each earlier year', 1_000_000), money('a1', 'Your yearly limit in 2024/25', 60000, undefined, 1_000_000), money('a0', 'Your yearly limit in 2023/24', 60000, undefined, 1_000_000)].map((x, k) => (k >= 5 ? { ...x, advanced: true } : x)),
    run: (v) => {
      const prev = PREVIOUS_THREE.map((y, k) => ({ year: y as AllowanceYear, savings: [v.s0, v.s1, v.s2][k], allowance: [v.a0, v.a1, v.a2][k], member: v.member === 1 }));
      const r = carryForward(prev, v.cur, v.aaCur);
      const room = Math.max(0, r.available - v.cur);
      return {
        head: [r.excess > 0 ? 'Over the yearly limit, after carry forward' : 'You can still pay in this year', m(r.excess > 0 ? r.excess : room)], assume: `Tax year ${P.taxYear} · ${m(v.cur)} already paid in this year, by you and your employer · a pension in each of the three earlier years`, sub: `Yearly limit available in 2026/27, unused years included: ${m(r.available)}.`,
        rows: [['2026/27 limit used first', m(r.current.fromCurrent)], ...[...r.rows].reverse().map((x): [string, string] => [`${x.year}: used now`, m(x.used)]), ...(r.rows[0] && r.rows[0].left > 0 ? [[`${r.rows[0].year}: still usable until 5 April 2027, then lost`, m(r.rows[0].left)] as [string, string]] : []), ['Can still be carried into 2027/28', m(r.carryIntoNext), 'total']],
        notes: ['Tax relief on your own payments is still limited to what you earn this year: carry forward raises the yearly limit, never that one.', v.member === 1 ? 'Each year counts only if you were in a UK pension scheme then, even with nothing paid in.' : 'Without a pension scheme in those years nothing can be carried forward.'],
        sticky: r.excess > 0 ? `Over by ${m(r.excess)} after carry forward` : `Room left this year: ${m(room)}`,
      };
    },
    footnote: 'HMRC’s carry forward guidance and pension schemes rates (see the sources below).',
  },

  sipp: {
    advancedLabel: 'Optional: your other pension payments',
    exemple: (v) => `Example for someone earning ${m(v.earnings)} who pays ${m(v.pay)} into a SIPP this year: change any figure below`,
    action: { page: 'higher-rate-pension-tax-relief', anchor: 'how-to-claim' },
    inputs: [money('earnings', 'Earnings this tax year', 60000, 'Salary or self-employed profits, before tax. Not rent, dividends or interest'), money('pay', 'You pay into the SIPP this year', 3000, 'From your bank, before any top-up. The provider adds £1 for every £4 you pay'), money('employer', 'Your employer’s payments into a workplace pension', 0, 'Only a private pension? Leave 0. Not sure? Your workplace pension statement shows it'), nationIn(), money('other', 'Your other pension payments this year, top-up included', 0, 'A workplace pension, for example. None? Leave 0', 1_000_000)].map((x) => (x.id === 'other' ? { ...x, advanced: true } : x)),
    run: (v) => {
      const r = relief({ salary: v.earnings, nation: nation(v.nation), method: 'ras', amount: v.pay });
      const aa = P.allowances.years[CURRENT].aa;
      // One figure for the room left (naive testers 2026-11-09, second round: two near-identical caps confused 2 out of 3):
      // what can still be paid from the bank with relief after this payment, the lower of the earnings limit and the allowance.
      const leftGross = Math.max(0, Math.min(Math.max(v.earnings, P.relief.basicAmount) - v.other - r.gross, aa - v.employer - v.other - r.gross));
      return {
        head: ['Goes into your SIPP', m(r.gross)], assume: `For one tax year, ${P.taxYear} · earnings ${m(v.earnings)} · you pay ${m(v.pay)} from your bank · ${nation(v.nation) === 'scotland' ? 'Scotland' : 'England, Wales or N. Ireland'}`, sub: r.claim > 0 ? `Your provider adds ${m(r.providerTopUp)} by itself. You claim another ${m(r.claim)} from HMRC (the tax office) yourself.` : 'You pay tax at the basic rate, so there is nothing more to claim.',
        rows: [['You pay from your bank', m(v.pay)], ['Added by the provider (£1 for every £4 you pay)', m(r.providerTopUp)], ['Extra you claim yourself from HMRC', m(r.claim)], ['What it really costs you', m(r.netCost), 'total'], ['You can still pay from your bank this year, with relief', m(leftGross * 0.8)]],
        bar: { segments: [{ label: 'Your money', value: Math.max(0, r.netCost), color: C1 }, { label: 'Added by provider', value: r.providerTopUp, color: C2 }, { label: 'Claimed from HMRC', value: r.claim, color: C3 }], total: r.gross, aria: 'Who pays into the SIPP' },
        notes: [r.overLimit > 0 ? `Relief stops at your earnings (or ${m(P.relief.basicAmount)} with the top-up): ${m(r.overLimit)} of this would get no relief.` : `That ${m(leftGross * 0.8)} becomes ${m(leftGross)} once the provider adds its top-up. Two limits apply and this is the lower one: your earnings, and the ${m(aa)} a year that can go into all your pensions.`],
        action: r.claim > 0 ? `How to claim this ${m(r.claim)}, step by step` : undefined,
        sticky: `${m(r.gross)} into the SIPP for ${m(r.netCost)} after relief`,
      };
    },
    footnote: 'HMRC 2026 to 2027 rates (see the sources below). Provider charges are not included.',
  },

  forecast: {
    advancedLabel: 'More: growth, charges, inflation, age to plan to',
    inputs: [{ id: 'age', label: 'Your age now', def: 40, unit: 'yrs', max: 100, decimals: 0 }, { id: 'retire', label: 'Age you want to retire', def: 67, unit: 'yrs', max: 100, decimals: 0 }, money('pot', 'Pension pots today', 60000, 'All your defined contribution pots'), money('monthly', 'Paid in each month, all in', 500, 'You, your employer and tax relief', 100_000),
      money('target', 'Yearly income you want, today’s money', 26000, 'Before tax, State Pension included', 1_000_000), { id: 'spa', label: 'Your State Pension age', def: 67, options: [{ value: '66', label: '66' }, { value: '67', label: '67' }, { value: '68', label: '68' }], help: 'Check it on GOV.UK by date of birth' },
      pct('growth', 'Investment growth a year', 5, 15), pct('charges', 'Charges a year', 0.5, 5), pct('inflation', 'Inflation a year', 2.5, 15), { id: 'to', label: 'Make the money last to age', def: 95, unit: 'yrs', max: 120, decimals: 0, advanced: true }, { id: 'sp', label: 'Include the full new State Pension?', def: 1, options: YESNO, advanced: true }],
    run: (v) => {
      const r = projectPot({ age: v.age, retireAge: v.retire, pot: v.pot, monthly: v.monthly, growth: v.growth / 100, charges: v.charges / 100, inflation: v.inflation / 100 });
      const sp = v.sp === 1 ? fullStatePension() : 0;
      const inc = levelIncome(r.pot, v.retire, v.to, r.realRate);
      const need = potNeeded(v.target, v.retire, v.to, v.spa, sp, r.realRate);
      const unit = projectPot({ age: v.age, retireAge: v.retire, pot: 0, monthly: 1, growth: v.growth / 100, charges: v.charges / 100, inflation: v.inflation / 100 }).pot;
      const already = projectPot({ age: v.age, retireAge: v.retire, pot: v.pot, monthly: 0, growth: v.growth / 100, charges: v.charges / 100, inflation: v.inflation / 100 }).pot;
      const monthlyNeeded = unit > 0 ? Math.max(0, (need - already) / unit) : 0;
      const atSpa = inc + sp;
      return {
        head: ['Pot at retirement, today’s money', m(r.pot)], sub: `About ${m(inc)} a year from the pot until ${Math.round(v.to)}, ${m(atSpa)} with the State Pension from ${v.spa}.`,
        rows: [['Years to go', String(r.years)], ['Paid in over that time', m(r.paid)], ['Growth after charges and inflation', m(r.growthPart)], ['Full new State Pension a year', m(sp)], ['Pot needed for your target income', m(need)], ['Monthly saving needed for it', m(monthlyNeeded), 'total']],
        bar: { segments: [{ label: 'Today’s pots', value: Math.max(0, v.pot), color: C1 }, { label: 'Paid in', value: r.paid, color: C2 }, { label: 'Growth', value: Math.max(0, r.growthPart), color: C3 }], total: Math.max(0, v.pot) + r.paid + Math.max(0, r.growthPart), aria: 'What the pot is made of' },
        notes: [`Real return used: ${pc(r.realRate, 1)} a year. Growth is not guaranteed and the result is an illustration, not a forecast of your scheme.`, `State Pension at ${m(sp)} a year assumes 35 qualifying years; check yours with the GOV.UK forecast. Retiring before ${v.spa} means the pot pays the whole income until then.`],
        sticky: `Pot ${m(r.pot)} at ${Math.round(v.retire)} · need ${m(need)} for ${m(v.target)} a year`,
      };
    },
    footnote: 'Illustration in today’s money. The only statutory figure is the full new State Pension of £241.30 a week (2026/27).',
  },

  drawdown: {
    advancedLabel: 'More: charges and inflation',
    inputs: [money('pot', 'Pot left after any tax-free cash', 300000, 'The invested drawdown fund'), money('draw', 'Yearly withdrawal, before tax', 18000, 'Rises with inflation each year', 1_000_000), { id: 'age', label: 'Age at the first withdrawal', def: 66, unit: 'yrs', max: 100, decimals: 0 }, pct('growth', 'Investment growth a year', 5, 15, undefined, false), pct('charges', 'Charges a year', 0.5, 5), pct('inflation', 'Inflation a year', 2.5, 15)],
    run: (v) => {
      const d = drawdown({ pot: v.pot, withdrawal: v.draw, growth: v.growth / 100, charges: v.charges / 100, inflation: v.inflation / 100, startAge: v.age });
      const to95 = levelIncome(v.pot, v.age, 95, d.realRate);
      return {
        head: [d.lastsForever ? 'The pot is still there at' : 'The money runs out at age', d.lastsForever ? `${Math.round(v.age) + 60}+` : String(d.endAge)], sub: d.lastsForever ? 'At this rate growth covers the withdrawals for 60 years or more.' : `${d.years} years of withdrawals, the last one partial (${m(d.lastPayment)}).`,
        rows: [['Withdrawal as a share of the pot', pc(v.pot > 0 ? v.draw / v.pot : 0, 1)], ['Real return after charges and inflation', pc(d.realRate, 1)], ['Withdrawal that lasts to age 95', m(to95)], ['Withdrawal growth alone could pay', m(d.sustainable)]],
        notes: ['Steady returns are assumed. Real markets go up and down, and a fall in the first years shortens the life of a pot more than the same fall later.', `Taking flexible income triggers the money purchase annual allowance of ${m(P.allowances.years[CURRENT].mpaa!)} for any further saving.`],
        sticky: d.lastsForever ? 'At this rate the pot lasts beyond 60 years' : `Runs out at ${d.endAge} · ${m(to95)} a year would last to 95`,
      };
    },
    footnote: 'Withdrawals at the start of each year, constant real return. Income Tax on withdrawals is not deducted here.',
  },
};

export function getTool(id: string): ToolSpec {
  const s = TOOLS[id];
  if (!s) throw new Error(`Unknown tool spec: ${id}`);
  return s;
}
export const TOOL_IDS = Object.keys(TOOLS);
export { compareMethods };
