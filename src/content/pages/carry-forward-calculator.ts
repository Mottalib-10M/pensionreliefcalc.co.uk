import { definePage } from '../../lib/guide-types';
import { P } from '../../lib/engine/params';
import { formatMoney } from '../../lib/format';

const AA = formatMoney(P.allowances.years['2026/27'].aa, 0);

export default definePage({
  id: 'carry-forward-calculator',
  group: 'allowances',
  order: 20,
  tool: { kind: 'tool:cf', props: { cur: 90000, s2: 30000, s1: 25000, s0: 10000 } },
  related: ['annual-allowance-calculator', 'sipp-calculator', 'money-purchase-annual-allowance', 'pension-tax-relief-on-125000-salary'],
  sources: ['leg_fa04_228a', 'hmrc_cf', 'hmrc_rates', 'leg_fa04_190'],
  slug: 'carry-forward-calculator',
  nav: 'Carry forward calculator',
  card: 'Unused annual allowance from 2023/24, 2024/25 and 2025/26 that you can still use in 2026/27, in the order the law sets.',
  title: 'Pension Carry Forward Calculator 2026/27: Unused Allowance',
  description: 'Pension carry forward for 2026/27: unused annual allowance from 2023/24, 2024/25 and 2025/26, used in the legal order, and what is left to carry into 2027/28.',
  h1: 'Pension carry forward calculator: unused allowance from the last three years',
  intro: `Only useful if you want to pay more than ${AA} into pensions this tax year, for example after a bonus. This carry forward calculator takes what went in this year and in the three years before: you see how much more you can pay.`,
  resume: (h) => {
    const r = h.A.carryForward([{ year: '2023/24', savings: 10000, member: true }, { year: '2024/25', savings: 25000, member: true }, { year: '2025/26', savings: 30000, member: true }], 90000);
    return `Carry forward lets you add the unused annual allowance of the three previous tax years to this year's ${h.m(h.P.allowances.years['2026/27'].aa)}, under the rules HMRC sets out (${h.src('hmrc_cf', 'HMRC, carry forward')}). Two rules decide the result. First, this year's allowance is always used up before anything is carried, and then the earliest year goes first, so 2023/24 is used before 2024/25 and 2025/26. Second, a year only counts if you were a member of a UK registered pension scheme at some point in it, even with nothing paid in. Someone who saved ${h.m(10000)}, ${h.m(25000)} and ${h.m(30000)} in those three years, each with a ${h.m(60000)} allowance, has ${h.m(r.available)} available in ${h.P.taxYear}. Paying in ${h.m(90000)} uses ${h.m(r.rows[0].used)} of the 2023/24 space and leaves ${h.m(r.carryIntoNext)} to carry into 2027/28, once 2023/24 drops out. Carry forward raises the allowance, not the limit on relief: personal contributions still only get tax relief up to your earnings for the year.`;
  },
  faqs: (h) => [
    { q: 'Which tax years can I carry forward from in 2026/27?', a: `2023/24, 2024/25 and 2025/26. Each of them had a standard allowance of ${h.m(60000)}, lower if you were tapered or had to use the money purchase annual allowance that year. On 6 April 2027 the 2023/24 space disappears and 2026/27 joins the three years you can carry from. HMRC's guidance asks you to keep records of what was paid in for each year.` },
    { q: 'Do I need to have paid into a pension to carry forward a year?', a: 'No. You need to have been a member of a UK registered pension scheme at some time in that tax year. A deferred member of an old workplace scheme counts, even with no contributions at all. A year in which you belonged to no scheme gives nothing, and the State Pension is not a registered pension scheme for this test.' },
    { q: 'Can I get tax relief on a large carry forward contribution?', a: 'Only up to your relevant UK earnings for the current tax year. Carry forward lets the contribution sit within the annual allowance, but a personal contribution above your earnings gets no relief. Employer contributions are not limited by your earnings, which is why a company director often uses carry forward through employer contributions instead, subject to the wholly and exclusively rules for the company.' },
    { q: 'What if I was tapered in one of the earlier years?', a: `Then the allowance for that year was lower than ${h.m(60000)}, and only the unused part of the lower figure can be carried. Open the advanced fields of the calculator and enter the allowance you actually had. The taper thresholds changed in 2020/21 and again in 2023/24, so a tapered year is worked out on its own rules.` },
  ],
  body: (h) => {
    const Y = h.P.allowances.years;
    const yrs = ['2016/17', '2017/18', '2018/19', '2019/20', '2020/21', '2021/22', '2022/23', '2023/24', '2024/25', '2025/26', '2026/27'] as const;
    const rows = yrs.map((y) => [y, h.m(Y[y].aa), h.m(Y[y].threshold), h.m(Y[y].adjusted), h.m(Y[y].minTaper), Y[y].mpaa === null ? 'not listed' : h.m(Y[y].mpaa!)]);
    const nm = h.A.carryForward([{ year: '2023/24', savings: 0, member: false }, { year: '2024/25', savings: 0, member: true }, { year: '2025/26', savings: 0, member: true }], 150000);
    return `<h2>Using the result</h2>
<p>The yearly limit (the annual allowance) is the most that can go into all your pensions in a tax year, yours and your employer's together, without a tax charge. Carry forward lets you add what you did not use in the three years before. The result says how much you can pay in without that charge; how much tax relief you get is shown by the ${h.a('sipp-calculator', 'SIPP calculator')}.</p>
<p>Read the result from the top. The big figure is what you can still pay in this tax year. The lines below show which earlier year each part comes from, most recent first, as in the form. A year you do not use within three years is lost: what is left of 2023/24 goes on 6 April 2027. If the result says you are over the limit, the extra is added to your income and taxed, unless you pay in less; the ${h.a('annual-allowance-calculator', 'annual allowance calculator')} works out that charge.</p>
<p>Your pension provider does not check this for you. Keep the yearly statements of the three earlier years, or ask each scheme for them, before you make a large payment.</p>
<h2>A year without scheme membership</h2>
<p>A self-employed person who joined a SIPP in May 2024 wants to pay ${h.m(150000)} in ${h.P.taxYear}. The tax year 2023/24 gives nothing, because they were not a member then. The allowance available is ${h.m(nm.available)}: this year's ${h.m(60000)} plus the unused ${h.m(60000)} of 2024/25 and 2025/26. With profits of ${h.m(150000)} the full payment would also get relief, because relief follows earnings (${h.src('leg_fa04_190', 'Finance Act 2004, section 190')}).</p>
<h2>Pension carry forward allowances for every year since 2016/17 (for advisers)</h2>
<p>The calculator uses the standard allowance of each year unless you enter a lower one. HMRC lists them on its ${h.src('hmrc_rates', 'pension schemes rates page')}, from which the table below is taken. The allowance rose from ${h.m(40000)} to ${h.m(60000)} on 6 April 2023, and the taper thresholds moved twice. Only the last three years matter for carry forward in ${h.P.taxYear}.</p>
${h.table(['Tax year', 'Annual allowance', 'Taper starts above this threshold income', 'and this adjusted income', 'Lowest tapered allowance', 'Limit after taking pension money (MPAA)'], rows, 'HMRC, pension schemes rates, read on ' + h.date(h.P.retrieved_at) + '. "Not listed": the page gives no MPAA for that year.', ['l', 'r', 'r', 'r', 'r', 'r'])}`;
  },
});
