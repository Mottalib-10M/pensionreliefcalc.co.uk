import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'pension-calculator',
  group: 'retirement',
  order: 10,
  tool: { kind: 'tool:forecast', props: { age: 40, retire: 67, pot: 60000, monthly: 500, target: 26000 } },
  related: ['drawdown-calculator', 'home', 'sipp-calculator', 'salary-sacrifice-calculator'],
  sources: ['gov_nsp', 'gov_spa', 'gov_nmpa', 'gov_taxpension'],
  slug: 'pension-calculator',
  nav: 'Pension calculator: how much you need',
  card: 'Your pot at retirement in today’s money, the income it pays with the State Pension, and the monthly saving a target income needs.',
  title: 'Pension Calculator: How Much You Need, in Today’s Money',
  description: 'Pension calculator in today’s money: your pot at retirement, the income it pays with the State Pension, and the pot and monthly saving a target income needs.',
  h1: 'Pension calculator: how much you need, and what you are on course for',
  intro: 'Enter your age, your pension pots and what goes in each month, then the yearly income you want. Everything is shown in today’s money, so £1 on the result buys what £1 buys now.',
  resume: (h) => {
    const r = h.F.projectPot({ age: 40, retireAge: 67, pot: 60000, monthly: 500, growth: 0.05, charges: 0.005, inflation: 0.025 });
    const sp = h.F.fullStatePension();
    const need = h.F.potNeeded(26000, 67, 95, 67, sp, r.realRate);
    return `How much pension you need depends on the income you want, the age you stop and how long the money must last, and the State Pension does a large part of the work. The full new State Pension is ${h.m2(h.P.statePension.fullWeekly)} a week in ${h.P.taxYear}, ${h.m(sp)} a year, for someone with ${h.P.statePension.qualifyingYearsFull} qualifying years (${h.src('gov_nsp', 'GOV.UK, new State Pension')}). It starts at your State Pension age, which you check by date of birth on ${h.src('gov_spa', 'GOV.UK')}. A 40-year-old with ${h.m(60000)} in pots who adds ${h.m(500)} a month, with 5% growth, 0.5% charges and 2.5% inflation, reaches about ${h.m(r.pot)} at 67 in today's money. To draw ${h.m(26000)} a year before tax from 67 to 95, with the full State Pension from 67, needs a pot of about ${h.m(need)}. The calculator shows both numbers, and the monthly saving that would close any gap. Private pensions can be taken from 55, rising to ${h.P.minimumPensionAge.from2028} on ${h.date(h.P.minimumPensionAge.changeDate)}.`;
  },
  faqs: (h) => [
    { q: 'How much pension do I need to retire comfortably?', a: `There is no single figure; it is your target income less the State Pension, for as many years as you plan for. For ${h.m(26000)} a year from 67 to 95 with the full State Pension, the calculator gives a pot of roughly ${h.m(h.F.potNeeded(26000, 67, 95, 67, h.F.fullStatePension(), h.F.realRate(0.05, 0.005, 0.025)))} at a real return of about 2%. Retiring earlier, or a lower return, raises it quickly.` },
    { q: 'Why does the calculator use today’s money?', a: 'Because a figure in future pounds is hard to judge. £300,000 in 27 years buys far less than £300,000 today. The calculator takes inflation out of the growth rate and assumes your monthly saving rises with prices, so every result can be compared with what things cost now. Change the inflation field to test a different assumption.' },
    { q: 'Is the State Pension included automatically?', a: `Yes, at the full new State Pension rate of ${h.m2(h.P.statePension.fullWeekly)} a week, from the State Pension age you choose. If you have fewer than ${h.P.statePension.qualifyingYearsFull} qualifying years you will get less, and nothing with fewer than ${h.P.statePension.qualifyingYearsMin}. Your own forecast on GOV.UK gives the amount you have built up; switch the State Pension off in the advanced fields to see the pot on its own.` },
    { q: 'What growth rate should I use for a pension?', a: 'The default of 5% a year before charges is an assumption, not a promise. A fund mostly in shares has done better than that over long periods but with large falls along the way; a cautious or cash fund grows more slowly. Try a lower rate to see how much your plan depends on it. Charges matter too: 1% a year takes a large share over decades.' },
  ],
  body: (h) => {
    const sp = h.F.fullStatePension();
    const rr = h.F.realRate(0.05, 0.005, 0.025);
    const targets = [15000, 20000, 26000, 35000, 45000];
    const rows = targets.map((t) => [h.m(t), h.m(h.F.potNeeded(t, 67, 95, 67, sp, rr)), h.m(h.F.potNeeded(t, 60, 95, 67, sp, rr)), h.m(h.F.potNeeded(t, 67, 95, 67, 0, rr))]);
    const ages = [25, 35, 45, 55];
    const rows2 = ages.map((a) => [String(a), h.m(h.F.projectPot({ age: a, retireAge: 67, pot: 0, monthly: 400, growth: 0.05, charges: 0.005, inflation: 0.025 }).pot)]);
    return `<h2>The pension pot a target income needs</h2>
<p>The figures below assume a real return of ${h.pc(rr, 1)} a year after charges and inflation, and income paid until 95. They are before Income Tax: pension income above the Personal Allowance is taxed, as ${h.src('gov_taxpension', 'GOV.UK explains')}, and a quarter of the pot can usually be taken tax free up to the ${h.m(h.P.allowances.lumpSumAllowance)} lump sum allowance.</p>
${h.table(['Yearly income wanted', 'Retire at 67', 'Retire at 60', 'At 67, no State Pension'], rows, `Pot needed in today's money. Full new State Pension of ${h.m(sp)} a year from 67. Engine of this site; assumptions in the calculator's advanced fields.`, ['l', 'r', 'r', 'r'])}
<p>Retiring at 60 costs much more than the seven extra years of income, because the pot alone pays everything until the State Pension starts. The last column shows how much the State Pension is worth: replacing it with a private pot would take a large sum.</p>
<h2>What ${h.m(400)} a month becomes, by starting age</h2>
${h.table(['Age you start', 'Pot at 67, today’s money'], rows2, 'Nothing saved before, the same assumptions. The monthly figure includes tax relief and employer contributions.', ['l', 'r'])}
<p>Starting at 25 rather than 45 more than triples the result, even though only twice as many payments go in. Tax relief makes each payment cheaper than it looks: ${h.m(400)} gross costs a basic rate taxpayer ${h.m(320)} by relief at source, and less by salary sacrifice. The ${h.a('home', 'pension tax relief calculator')} shows what your own contributions cost, and the ${h.a('salary-sacrifice-calculator', 'salary sacrifice calculator')} what changes in April 2029.</p>
<h2>Limits of a projection</h2>
<p>The calculator uses one steady return every year, while real funds rise and fall. It does not know your scheme's charges, any defined benefit pension or the tax you pay on withdrawals. Once you know your pot at retirement, the ${h.a('drawdown-calculator', 'drawdown calculator')} shows how long a chosen income lasts. The earliest age to take a private pension rises from 55 to ${h.P.minimumPensionAge.from2028} on ${h.date(h.P.minimumPensionAge.changeDate)} under the ${h.src('gov_nmpa', 'change to the normal minimum pension age')}, with some protected exceptions.</p>
<h2>Reading the result</h2>
<p>The headline figure is the pot at the age you chose, after charges and inflation, so you can compare it with prices today. The line below gives the yearly income that pot could pay, level in real terms, until the age you plan to, and the total once the State Pension starts. The last row is the monthly saving, contributions and tax relief together, that would make the pot match your target. If it is far above what you pay now, the options are the usual ones: retire later, aim for a lower income, take more investment risk or pay in more. Moving the retirement age by two years usually changes the answer more than a modest change in growth. Remember that a basic rate taxpayer's ${h.m(100)} of contribution costs ${h.m(80)}, and an employer match is money you would otherwise not get.</p>`;
  },
});
