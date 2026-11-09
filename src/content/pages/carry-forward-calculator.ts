import { definePage } from '../../lib/guide-types';

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
  intro: 'Enter your total pension savings for this tax year and each of the three before into this carry forward calculator. You get the allowance available now, what is used from each year and what you can still carry into 2027/28.',
  resume: (h) => {
    const r = h.A.carryForward([{ year: '2023/24', savings: 10000, member: true }, { year: '2024/25', savings: 25000, member: true }, { year: '2025/26', savings: 30000, member: true }], 90000);
    return `Carry forward lets you add the unused annual allowance of the three previous tax years to this year's ${h.m(h.P.allowances.years['2026/27'].aa)}, under ${h.src('leg_fa04_228a', 'section 228A of the Finance Act 2004')}. Two rules decide the result. First, this year's allowance is always used up before anything is carried, and then the earliest year goes first, so 2023/24 is used before 2024/25 and 2025/26. Second, a year only counts if you were a member of a UK registered pension scheme at some point in it, even with nothing paid in. Someone who saved ${h.m(10000)}, ${h.m(25000)} and ${h.m(30000)} in those three years, each with a ${h.m(60000)} allowance, has ${h.m(r.available)} available in ${h.P.taxYear}. Paying in ${h.m(90000)} uses ${h.m(r.rows[0].used)} of the 2023/24 space and leaves ${h.m(r.carryIntoNext)} to carry into 2027/28, once 2023/24 drops out. Carry forward raises the allowance, not the limit on relief: personal contributions still only get tax relief up to your earnings for the year.`;
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
<p>The annual allowance is the most that can go into your pensions in a tax year, yours and your employer's together, before a tax charge. Carry forward lets you add what you did not use in the three years before.</p>
<p>Paying a large sum through carry forward is common in the year of a bonus, a business sale or a final salary jump. The result tells you how much you can save without an annual allowance charge; it does not tell you how much relief you get, which depends on the tax you paid. Feed the gross figure into the ${h.a('sipp-calculator', 'SIPP calculator')} to see the top-up and the claim, or into the ${h.a('annual-allowance-calculator', 'annual allowance calculator')} if your income is high enough for the taper. If you have already taken flexible income from a pension, carry forward cannot lift the ${h.m(Y['2026/27'].mpaa!)} limit on money purchase savings, as the ${h.a('money-purchase-annual-allowance', 'MPAA guide')} explains. HMRC's own ${h.src('hmrc_cf', 'carry forward steps')} ask you to check each year's pension savings statement.</p>
<p>A last practical point: the scheme does not check carry forward for you. Providers accept a contribution of any size within your earnings, and it is your Self Assessment return that shows whether an annual allowance charge is due. Keep the pension savings statements of the three earlier years, or ask each scheme for the pension input amounts, before making the payment.</p>
<p>The calculator also shows what is left to carry into 2027/28: the unused part of 2024/25 and 2025/26 after this year's payment, plus whatever is left of the 2026/27 allowance itself. That figure is the starting point for next year's planning.</p>
<h2>A year without scheme membership</h2>
<p>A self-employed person who joined a SIPP in May 2024 wants to pay ${h.m(150000)} in ${h.P.taxYear}. The tax year 2023/24 gives nothing, because they were not a member then. The allowance available is ${h.m(nm.available)}: this year's ${h.m(60000)} plus the unused ${h.m(60000)} of 2024/25 and 2025/26. With profits of ${h.m(150000)} the full payment would also get relief, because relief follows earnings (${h.src('leg_fa04_190', 'Finance Act 2004, section 190')}).</p>
<h2>Pension carry forward allowances for every year since 2016/17 (for advisers)</h2>
<p>The calculator uses the standard allowance of each year unless you enter a lower one. HMRC lists them on its ${h.src('hmrc_rates', 'pension schemes rates page')}, from which the table below is taken. The allowance rose from ${h.m(40000)} to ${h.m(60000)} on 6 April 2023, and the taper thresholds moved twice. Only the last three years matter for carry forward in ${h.P.taxYear}.</p>
${h.table(['Tax year', 'Annual allowance', 'Taper starts above this threshold income', 'and this adjusted income', 'Lowest tapered allowance', 'Limit after taking pension money (MPAA)'], rows, 'HMRC, pension schemes rates, read on ' + h.date(h.P.retrieved_at) + '. "Not listed": the page gives no MPAA for that year.', ['l', 'r', 'r', 'r', 'r', 'r'])}`;
  },
});
