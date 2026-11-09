import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'drawdown-calculator',
  group: 'retirement',
  order: 20,
  tool: { kind: 'tool:drawdown', props: { pot: 300000, draw: 18000, age: 66 } },
  related: ['pension-calculator', 'money-purchase-annual-allowance', 'annual-allowance-calculator', 'home'],
  sources: ['gov_taxpension', 'hmrc_mpaa', 'gov_lsa', 'gov_nsp'],
  slug: 'drawdown-calculator',
  nav: 'Pension drawdown calculator',
  card: 'How long a drawdown pot lasts at a yearly withdrawal that keeps pace with prices, and the income that lasts to 95.',
  title: 'Pension Drawdown Calculator: How Long Your Pot Will Last',
  description: 'Pension drawdown calculator: the age your pot runs out at a yearly withdrawal rising with inflation, the income that lasts to 95, and the MPAA once you draw.',
  h1: 'Pension drawdown calculator: how long the money lasts',
  intro: 'Enter the pot left after any tax-free cash, the yearly withdrawal and your age into this drawdown calculator. It shows the age the pot runs out and the withdrawal that would last to 95.',
  resume: (h) => {
    const d = h.F.drawdown({ pot: 300000, withdrawal: 18000, growth: 0.05, charges: 0.005, inflation: 0.025, startAge: 66 });
    const to95 = h.F.levelIncome(300000, 66, 95, d.realRate);
    return `Flexi-access drawdown keeps your pension invested and lets you take income as and when you choose. Each withdrawal is taxed as income, apart from the tax-free part, and the first flexible withdrawal brings in the money purchase annual allowance of ${h.m(h.P.allowances.years['2026/27'].mpaa!)} for any further saving (${h.src('hmrc_mpaa', 'HMRC')}). How long the pot lasts depends on three things: the share you take each year, the return after charges, and inflation, since a withdrawal that keeps its buying power has to rise every year. With ${h.m(300000)} invested at 5% growth, 0.5% charges and 2.5% inflation, taking ${h.m(18000)} a year from 66, rising with prices, ${d.lastsForever ? 'lasts beyond 60 years' : `runs out at about ${d.endAge}`}. A level income of ${h.m(to95)} in today's money would last until 95 on the same assumptions. Add the full new State Pension of ${h.m(h.F.fullStatePension())} a year to see the total. Real markets vary, and a fall early in retirement shortens the life of a pot more than the same fall later on.`;
  },
  faqs: (h) => [
    { q: 'How much can I take from a £300,000 pension pot each year?', a: `On the default assumptions, a real return of about ${h.pc(h.F.realRate(0.05, 0.005, 0.025), 1)}, ${h.m(h.F.levelIncome(300000, 66, 95, h.F.realRate(0.05, 0.005, 0.025)))} a year rising with prices lasts from 66 to 95. Taking more is possible but shortens the period. The figure is before Income Tax and after any tax-free cash already taken; a smaller return or a longer life both lower it.` },
    { q: 'Is pension drawdown income taxed?', a: 'Yes. Each withdrawal is added to your other income for the year, State Pension included, and taxed at your rates, after any tax-free part. Your provider uses an emergency tax code on the first payment unless HMRC has sent one, so the first month often has too much tax taken; you can reclaim it during the year with the form HMRC provides.' },
    { q: 'Can I keep paying into a pension after starting drawdown?', a: `Yes, but once you have taken flexible income the money purchase annual allowance applies: ${h.m(h.P.allowances.years['2026/27'].mpaa!)} a year of defined contribution savings before a charge, with no carry forward. Taking only the tax-free lump sum and leaving the rest invested does not trigger it, nor does buying a lifetime annuity that cannot fall.` },
    { q: 'What happens to my drawdown pot when I die?', a: 'What remains goes to the beneficiaries you named, as a lump sum or as their own drawdown. If you die before 75 it is usually free of Income Tax within the lump sum and death benefit allowance; after 75 it is taxed as the beneficiary’s income. Keep the nomination form with your provider up to date, since the scheme decides who is paid.' },
  ],
  body: (h) => {
    const rates = [0.03, 0.04, 0.05, 0.06, 0.07];
    const growths = [0.03, 0.05, 0.07];
    const rows = rates.map((w) => [h.pc(w), ...growths.map((g) => { const d = h.F.drawdown({ pot: 100000, withdrawal: 100000 * w, growth: g, charges: 0.005, inflation: 0.025, startAge: 66 }); return d.lastsForever ? '60+ years' : `${d.years} years`; })]);
    const yr = (w: number) => { const d = h.F.drawdown({ pot: 100000, withdrawal: 100000 * w, growth: 0.05, charges: 0.005, inflation: 0.025, startAge: 66 }); return d.lastsForever ? 'more than 60' : String(d.years); };
    const y4 = yr(0.04), y6 = yr(0.06);
    return `<h2>How long a pot lasts, by withdrawal rate</h2>
<p>The withdrawal rate is the first year's income as a share of the pot. After that the income rises with inflation, here 2.5% a year. Three growth rates are shown before charges of 0.5%.</p>
${h.table(['First-year withdrawal', 'Growth 3%', 'Growth 5%', 'Growth 7%'], rows, 'Years of withdrawals before the pot is empty, steady returns. Engine of this site.', ['l', 'r', 'r', 'r'])}
<p>Taking 4% with 5% growth gives ${y4} years of income; taking 6% gives ${y6}. Small changes in the withdrawal rate move the end date by many years. The table assumes the same return every year, so it shows the average path; years of losses at the start make it shorter, which is called sequence risk.</p>
<h2>Pension drawdown and tax</h2>
<p>Withdrawals sit on top of the State Pension in your tax calculation. Someone with the full new State Pension of ${h.m(h.F.fullStatePension())} a year has only ${h.m(h.I.personalAllowance - h.F.fullStatePension())} of Personal Allowance left, so most drawdown income is taxed at 20% at least. Keeping withdrawals below ${h.m(h.higherStart)} of total income avoids the higher rate. The ${h.src('gov_lsa', 'lump sum allowance')} caps the tax-free cash at ${h.m(h.P.allowances.lumpSumAllowance)} for most people. The calculator leaves tax out so that the life of the pot stays clear; ${h.src('gov_taxpension', 'GOV.UK')} explains how pension income is taxed.</p>
<h2>Next steps</h2>
<p>To see what pot you are on course for, use the ${h.a('pension-calculator', 'pension calculator')}. If you plan to keep working and saving after you start drawing, read the ${h.a('money-purchase-annual-allowance', 'guide to the money purchase annual allowance')} first: the ${h.m(h.P.allowances.years['2026/27'].mpaa!)} limit applies from the day after your first flexible withdrawal. Free guidance on drawdown is offered by Pension Wise, the government service, to anyone aged 50 or over with a defined contribution pension.</p>
<h2>Choosing a withdrawal</h2>
<p>There are two ways to use the calculator. Start from the income you want and see when it runs out, or start from the age you want the money to last to and read the withdrawal that gets you there on the line called "withdrawal that lasts to age 95". Both assume returns are steady and the withdrawal keeps pace with prices. Many people take more in the first years of retirement, when they travel, and less later; others delay the State Pension or use part of the pot to buy an annuity for a guaranteed floor. Running the calculator with growth of 3% gives a cautious view; the gap between that and 5% shows how much rides on markets. Review the plan each year with your actual pot.</p>`;
  },
});
