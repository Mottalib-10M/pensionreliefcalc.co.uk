import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'salary-sacrifice-calculator',
  group: 'sacrifice',
  order: 10,
  tool: { kind: 'tool:sacrifice', props: { salary: 52000, amount: 4000, share: 0 } },
  related: ['salary-sacrifice-2029-cap', 'salary-sacrifice-child-benefit', 'relief-at-source-vs-net-pay', 'salary-sacrifice-car-calculator'],
  sources: ['hmrc_ss', 'gov_ss2029', 'hmrc_employer', 'gov_rates'],
  slug: 'salary-sacrifice-calculator',
  nav: 'Salary sacrifice pension calculator',
  card: 'Take-home pay before and after a pension salary sacrifice, the NI saved now and from April 2029, against relief at source.',
  title: 'Salary Sacrifice Pension Calculator 2026/27 and April 2029',
  description: 'Salary sacrifice pension calculator: take-home pay, tax and NI saved in 2026/27, the cost once the £2,000 NI cap starts in April 2029, against relief at source.',
  h1: 'Salary sacrifice pension calculator: take-home pay now and from April 2029',
  intro: 'Enter your salary and the amount you give up a year. The calculator shows what reaches the pension, how much less you take home, and how that changes when the £2,000 cap on NI relief starts.',
  resume: (h) => {
    const r = h.relief({ salary: 52000, method: 'sacrifice', amount: 4000 });
    const c = h.R.compareMethods(52000, 4000);
    return `With salary sacrifice you agree a lower salary and your employer pays the difference into your pension. Because the money never becomes pay, it escapes Income Tax and Class 1 National Insurance at once: 8% of employee NI between ${h.m(h.P.ni.primaryThreshold)} and ${h.m(h.P.ni.upperEarningsLimit)}, 2% above, and the employer's own 15% (${h.src('hmrc_ss', 'HMRC, salary sacrifice for employers')}). On ${h.m(52000)}, giving up ${h.m(4000)} saves ${h.m(r.incomeTaxSaved)} of Income Tax and ${h.m(r.niSaved)} of NI, so take-home pay falls by only ${h.m(r.netCost)}. The same ${h.m(4000)} paid by relief at source would cost ${h.m(c.ras.netCost)}. The government has announced that from 6 April 2029 only the first ${h.m(h.P.sacrifice.niCap)} a year of pension salary sacrifice will be free of NI, for employees and employers (${h.src('gov_ss2029', 'HM Treasury and HMRC, April 2029 changes')}); Income Tax relief stays. On these figures the sacrifice would then cost ${h.m(c.sacrifice2029.netCost)}.`;
  },
  faqs: (h) => [
    { q: 'Does salary sacrifice reduce my State Pension?', a: `Not as long as your cash salary stays above the lower earnings limit of ${h.m(h.P.ni.lowerEarningsLimit)} a year, which gives you a qualifying year without paying NI. Below it you would lose the year unless you get credits. Your employer cannot take you under the National Minimum Wage either, so very low earners are usually kept out of sacrifice schemes.` },
    { q: 'What does salary sacrifice do to my mortgage or life cover?', a: 'Lenders and some benefits look at your contractual salary, which is the lower figure after the sacrifice. Many employers keep a notional salary for pay rises, death in service and bonuses, but they are not obliged to. Ask before you sign, and check statutory maternity or paternity pay, which follows actual earnings in the reference period.' },
    { q: 'Can I stop a salary sacrifice at any time?', a: 'HMRC expects the arrangement to be a real change to your contract, so most employers only allow changes once a year or after a life event such as marriage, a birth or a fall in household income. Opting out of the pension does not always end the sacrifice on the same day. The scheme booklet sets the windows.' },
    { q: 'Will my employer add its NI saving to my pension?', a: 'Some do, in full or in part, and the calculator has a field for it. It is a choice of the employer, not a rule. When it is passed on, the extra money lands as employer contribution and counts towards your annual allowance. From April 2029 the employer saving above the cap disappears, so a promise to share it may be reviewed.' },
  ],
  body: (h) => {
    const sal = [28000, 40000, 52000, 70000, 95000];
    const rows = sal.map((s) => { const a = h.relief({ salary: s, method: 'sacrifice', amount: 4000 }), b = h.relief({ salary: s, method: 'sacrifice', amount: 4000, after2029: true }), c = h.relief({ salary: s, method: 'ras', amount: 3200 });
      return [h.m(s), h.m(c.netCost), h.m(a.netCost), h.m(b.netCost), h.m(a.employerNiSaved), h.m(b.employerNiSaved)]; });
    return `<h2>${h.m(4000)} into the pension, five salaries</h2>
<p>Each row puts ${h.m(4000)} gross into the pension and shows the effect on take-home pay three ways. The NI gain is largest between ${h.m(h.P.ni.primaryThreshold)} and ${h.m(h.P.ni.upperEarningsLimit)}, where employee NI is 8%; above that it is only 2%, which is why higher earners care more about the Income Tax and the employer's 15%.</p>
${h.table(['Salary', 'Relief at source', 'Sacrifice now', 'Sacrifice from April 2029', 'Employer NI saved now', 'From April 2029'], rows, `Cost to take-home pay of ${h.m(4000)} into a pension, ${h.P.taxYear} rates, England, Wales or Northern Ireland. The April 2029 column keeps today's thresholds, which may change.`, ['l', 'r', 'r', 'r', 'r', 'r'])}
<h2>What the calculator counts, and what it does not</h2>
<p>It applies the ${h.P.taxYear} Income Tax bands and Class 1 rates for category A employees from ${h.src('hmrc_employer', 'HMRC, rates and thresholds for employers 2026 to 2027')}, on a whole-year basis. Payroll works period by period, so a single month with a bonus can give a slightly different NI figure. It ignores student loan repayments, which also fall when salary is sacrificed, and benefits such as Universal Credit. For a sacrificed salary that crosses ${h.m(100000)}, the gain on the Personal Allowance is included, since salary given up lowers adjusted net income.</p>
<h2>Before and after the cap</h2>
<p>The £2,000 cap is government policy, published by HM Treasury and HMRC on ${h.date(h.P.sacrifice.niCapAnnounced)}, with further guidance promised before April 2029. The calculator applies it to the employee and employer NI on the part of the sacrifice above ${h.m(h.P.sacrifice.niCap)} and keeps Income Tax relief unchanged, as announced. The ${h.a('salary-sacrifice-2029-cap', 'guide to the April 2029 cap')} explains who loses most, and the ${h.a('salary-sacrifice-child-benefit', 'Child Benefit guide')} shows why a family with income between ${h.m(h.P.childBenefit.hicbcFrom)} and ${h.m(h.P.childBenefit.hicbcTo)} can still gain far more than NI. Electric cars through sacrifice follow other rules: see the ${h.a('salary-sacrifice-car-calculator', 'car calculator')}.</p>
<h2>A worked example with an employer top-up</h2>
<p>Suppose the employer passes on half of its NI saving. On ${h.m(52000)}, sacrificing ${h.m(4000)} saves the employer ${h.m(h.relief({ salary: 52000, method: 'sacrifice', amount: 4000 }).employerNiSaved)}, and half of that, ${h.m(h.relief({ salary: 52000, method: 'sacrifice', amount: 4000, employerNiShare: 0.5 }).employerNiPassed)}, is added to your pension. The pension then receives ${h.m(h.relief({ salary: 52000, method: 'sacrifice', amount: 4000, employerNiShare: 0.5 }).gross)} for the same fall in take-home pay. Set the employer NI field to 50 to see it. Under the April 2029 rules the employer would save NI only on the first ${h.m(h.P.sacrifice.niCap)}, so the top-up would fall too. Payslips show the sacrifice as a deduction before tax, often labelled with the scheme name; the pension provider records the money as an employer contribution.</p>`;
  },
});
