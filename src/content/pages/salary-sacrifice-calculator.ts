import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'salary-sacrifice-calculator',
  group: 'sacrifice',
  order: 10,
  tool: { kind: 'tool:sacrifice', props: { salary: 45000, amount: 3750, share: 0 } },
  related: ['salary-sacrifice-2029-cap', 'salary-sacrifice-child-benefit', 'relief-at-source-vs-net-pay', 'salary-sacrifice-car-calculator'],
  sources: ['hmrc_ss', 'gov_ss2029', 'hmrc_employer', 'gov_rates'],
  slug: 'salary-sacrifice-calculator',
  nav: 'Salary sacrifice pension calculator',
  card: 'Take-home pay before and after a pension salary sacrifice, the NI saved now and from April 2029, against relief at source.',
  title: 'Salary Sacrifice Pension Calculator 2026/27 and April 2029',
  description: 'Salary sacrifice pension calculator: take-home pay, tax and NI saved in 2026/27, the cost once the £2,000 NI cap starts in April 2029, against relief at source.',
  h1: 'Salary sacrifice pension calculator: take-home pay now and from April 2029',
  intro: 'Enter your salary and the amount you give up a year. The calculator shows what reaches the pension, how much less you take home, and what changes from April 2029, when the National Insurance (NI) saving is capped.',
  resume: (h) => {
    const r = h.relief({ salary: 45000, method: 'sacrifice', amount: 3750 });
    const c = h.R.compareMethods(45000, 3750);
    return `With salary sacrifice you agree a lower salary and your employer pays the difference into your pension. Because the money never becomes pay, it escapes Income Tax and National Insurance (NI) at once: 8% of employee NI between ${h.m(h.P.ni.primaryThreshold)} and ${h.m(h.P.ni.upperEarningsLimit)}, 2% above, and the employer's own 15% (${h.src('hmrc_ss', 'HMRC, salary sacrifice for employers')}). On ${h.m(45000)}, giving up ${h.m(3750)} saves ${h.m(r.incomeTaxSaved)} of Income Tax and ${h.m(r.niSaved)} of NI, so take-home pay falls by only ${h.m(r.netCost)}. The same ${h.m(3750)} paid from your bank (relief at source) would cost ${h.m(c.ras.netCost)}. The government has announced that from 6 April 2029 only the first ${h.m(h.P.sacrifice.niCap)} a year of pension salary sacrifice will be free of NI, for employees and employers (${h.src('gov_ss2029', 'HM Treasury and HMRC, April 2029 changes')}); Income Tax relief stays. On these figures the sacrifice would then cost ${h.m(c.sacrifice2029.netCost)}.`;
  },
  faqs: (h) => [
    { q: 'Does salary sacrifice reduce my State Pension?', a: `Not as long as your cash salary stays above the lower earnings limit of ${h.m(h.P.ni.lowerEarningsLimit)} a year, which gives you a qualifying year without paying NI. Below it you would lose the year unless you get credits. Your employer cannot take you under the National Minimum Wage either, so very low earners are usually kept out of sacrifice schemes.` },
    { q: 'What does salary sacrifice do to my mortgage or life cover?', a: 'Lenders and some benefits look at your contractual salary, which is the lower figure after the sacrifice. Many employers keep a notional salary for pay rises, death in service and bonuses, but they are not obliged to. Ask before you sign, and check statutory maternity or paternity pay, which follows actual earnings in the reference period.' },
    { q: 'Can I stop a salary sacrifice at any time?', a: 'HMRC expects the arrangement to be a real change to your contract, so most employers only allow changes once a year or after a life event such as marriage, a birth or a fall in household income. Opting out of the pension does not always end the sacrifice on the same day. The scheme booklet sets the windows.' },
    { q: 'Will my employer add its NI saving to my pension?', a: 'Some do, in full or in part, and the calculator has a field for it. It is a choice of the employer, not a rule. When it is passed on, the extra money lands as employer contribution and counts towards your annual allowance. From April 2029 the employer saving above the cap disappears, so a promise to share it may be reviewed.' },
  ],
  body: (h) => {
    const sal = [45000, 52000, 75000, 110000];
    const rows = sal.map((s) => { const a = h.relief({ salary: s, method: 'sacrifice', amount: 3750 }), b = h.relief({ salary: s, method: 'sacrifice', amount: 3750, after2029: true }), c = h.relief({ salary: s, method: 'ras', amount: 3000 });
      return [h.m(s), h.m(c.netCost), h.m(a.netCost), h.m(b.netCost)]; });
    const emp = h.relief({ salary: 45000, method: 'sacrifice', amount: 3750 }).employerNiSaved;
    return `<h2>${h.m(3750)} into the pension, four salaries</h2>
<p>Each row puts ${h.m(3750)} into the pension. Find the salary closest to yours: “Cost by sacrifice now” is what it costs you today. Your employer also saves ${h.m(emp)} of its own National Insurance at every salary; it keeps that money unless it chooses to share it with you.</p>
${h.table(['Salary', 'Cost paid from your bank', 'Cost by sacrifice now', 'Cost by sacrifice from April 2029'], rows, `What it really costs you to put ${h.m(3750)} into a pension, for one tax year, ${h.P.taxYear}, England, Wales or Northern Ireland. The April 2029 column keeps today's thresholds.`, ['l', 'r', 'r', 'r'])}
<h2>What the salary sacrifice calculator counts, and what it does not</h2>
<p>It applies the ${h.P.taxYear} Income Tax bands and the NI rates for most employees from ${h.src('hmrc_employer', 'HMRC, rates and thresholds for employers 2026 to 2027')}, on a whole-year basis. Payroll works period by period, so a single month with a bonus can give a slightly different NI figure. It ignores student loan repayments, which also fall when salary is sacrificed, and benefits such as Universal Credit. For a sacrificed salary that crosses ${h.m(100000)}, the gain on the Personal Allowance is included, since salary given up lowers adjusted net income.</p>
<h2>Before and after the cap</h2>
<p>The £2,000 cap is government policy, published by HM Treasury and HMRC on ${h.date(h.P.sacrifice.niCapAnnounced)}, with further guidance promised before April 2029. The calculator applies it to the employee and employer NI on the part of the sacrifice above ${h.m(h.P.sacrifice.niCap)} and keeps Income Tax relief unchanged, as announced. The ${h.a('salary-sacrifice-2029-cap', 'guide to the April 2029 cap')} explains who loses most, and the ${h.a('salary-sacrifice-child-benefit', 'Child Benefit guide')} shows why a family with income between ${h.m(h.P.childBenefit.hicbcFrom)} and ${h.m(h.P.childBenefit.hicbcTo)} can still gain far more than NI. Electric cars through sacrifice follow other rules: see the ${h.a('salary-sacrifice-car-calculator', 'car calculator')}.</p>
<h2>A worked example with an employer top-up</h2>
<p>Suppose the employer passes on half of its NI saving. On ${h.m(45000)}, sacrificing ${h.m(3750)} saves the employer ${h.m(h.relief({ salary: 45000, method: 'sacrifice', amount: 3750 }).employerNiSaved)}, and half of that, ${h.m(h.relief({ salary: 45000, method: 'sacrifice', amount: 3750, employerNiShare: 0.5 }).employerNiPassed)}, is added to your pension. The pension then receives ${h.m(h.relief({ salary: 45000, method: 'sacrifice', amount: 3750, employerNiShare: 0.5 }).gross)} for the same fall in take-home pay. Open “Optional” in the calculator and set the employer field to 50 to see it. Under the April 2029 rules the employer would save NI only on the first ${h.m(h.P.sacrifice.niCap)}, so the top-up would fall too. Payslips show the sacrifice as a deduction before tax, often labelled with the scheme name; the pension provider records the money as an employer contribution.</p>`;
  },
});
