import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'pension-contributions-over-100k',
  group: 'relief',
  order: 40,
  mini: { kind: 'mini:trap', props: { salary: 115000 } },
  related: ['pension-tax-relief-on-100000-salary', 'pension-tax-relief-on-125000-salary', 'annual-allowance-calculator', 'salary-sacrifice-child-benefit'],
  sources: ['gov_rates', 'gov_relief', 'gov_tfc', 'hmrc_claim', 'hmrc_taper'],
  slug: 'pension-contributions-over-100k',
  nav: 'Contributions over £100,000',
  card: 'The 60% band between £100,000 and £125,140, the contribution that clears it, bonuses, timing and childcare.',
  title: 'Pension Contributions Over £100k: The 60% Tax Trap 2026/27',
  description: 'Pension contributions over £100k: why income from £100,000 to £125,140 is taxed at 60%, the contribution that clears it, bonuses, timing, Tax-Free Childcare',
  h1: 'Pension contributions over £100,000: getting out of the 60% band',
  intro: 'Between £100,000 and £125,140 of income, each extra pound costs 60p in Income Tax because the Personal Allowance is withdrawn. A pension contribution reverses it. Here is how much, when and by which route.',
  resume: (h) => {
    const g = h.R.contributionToReach100k(115000);
    const r = h.relief({ salary: 115000, method: 'netpay', amount: g });
    return `The Personal Allowance of ${h.m(h.I.personalAllowance)} is reduced by ${h.m(1)} for every ${h.m(2)} of adjusted net income above ${h.m(100000)}, so it is gone at ${h.m(h.I.paZeroAt)} (${h.src('gov_rates', 'GOV.UK, Income Tax rates')}). In that range each extra ${h.m(100)} of income pays ${h.m(40)} of higher rate tax and removes ${h.m(50)} of allowance, which costs another ${h.m(20)}: an effective rate of 60%, plus 2% NI on earnings. Pension contributions reduce adjusted net income, so they work the other way. Someone with ${h.m(115000)} of adjusted net income who makes a gross contribution of ${h.m(g)} gets back to ${h.m(100000)}, saves ${h.m(r.incomeTaxSaved)} of tax and restores ${h.m(r.paAfter - r.paBefore)} of allowance: ${h.pc(r.effectiveRate)} relief. By salary sacrifice or net pay this happens on payday; by relief at source you pay 80% of the gross amount and claim the rest (${h.src('hmrc_claim', 'HMRC')}). The same ${h.m(100000)} line also decides who can use Tax-Free Childcare.`;
  },
  faqs: (h) => [
    { q: 'How much do I need to put in my pension to avoid the 60% tax trap?', a: `The gross amount by which your adjusted net income exceeds ${h.m(100000)}. On ${h.m(112000)} that is ${h.m(12000)} gross: ${h.m(9600)} paid into a relief at source pension, or ${h.m(12000)} through net pay or salary sacrifice. Employer contributions that do not replace salary do not count, because they were never part of your income.` },
    { q: 'Does a bonus count towards the £100,000 limit?', a: 'Yes. Adjusted net income includes all taxable income for the tax year: salary, bonus, benefits in kind, rental profit, interest and dividends. A bonus paid in March counts in the year ending on 5 April. If your employer offers bonus sacrifice, choosing it before the bonus is awarded keeps it out of income entirely, often with NI savings for both of you.' },
    { q: 'Is the 60% rate the same in Scotland?', a: 'It is higher. Scottish taxpayers pay the 45% advanced rate between £75,001 and £125,140, and lose the allowance at the same speed, so the effective rate in the taper is 67.5% before NI. A pension contribution clears it in the same way, and the relief is correspondingly larger.' },
    { q: 'What happens to Tax-Free Childcare if my income goes over £100,000?', a: 'You, or your partner, cannot use Tax-Free Childcare for any period when either of you expects adjusted net income above £100,000 for the tax year. The government top-up is worth up to £2,000 a year per child. Pension contributions that keep adjusted net income at or below the limit keep the account open, which can be worth more than the tax.' },
  ],
  body: (h) => {
    const sal = [102000, 106000, 110000, 115000, 120000, 125140, 130000];
    const rows = sal.map((s) => { const g = h.R.contributionToReach100k(s); const r = h.relief({ salary: s, method: 'netpay', amount: g }); const sc = h.relief({ salary: s, nation: 'scotland', method: 'netpay', amount: g }); return [h.m(s), h.m(g), h.m(g * 0.8), h.m(r.incomeTaxSaved), h.m(sc.incomeTaxSaved)]; });
    const ex = h.relief({ salary: 120000, method: 'ras', amount: 16000 });
    return `<h2>The contribution that clears the band</h2>
${h.table(['Adjusted net income', 'Gross contribution to reach £100,000', 'Paid by relief at source', 'Tax saved, rest of UK', 'Tax saved, Scotland'], rows, `${h.P.taxYear}. Tax saved is Income Tax only; NI savings from salary sacrifice come on top. Engine of this site.`, ['l', 'r', 'r', 'r', 'r'])}
<p>Up to ${h.m(h.I.paZeroAt)} the saving is 60% of the gross contribution in the rest of the UK and 67.5% in Scotland. From ${h.m(130000)}, the first ${h.m(130000 - h.I.paZeroAt)} of contribution comes out of income taxed at 45% (48% in Scotland), and only the next ${h.m(h.I.paZeroAt - 100000)} gets the 60% effect.</p>
<h2>Which income counts</h2>
<p>Adjusted net income starts from your total taxable income for the year: employment income and benefits in kind, self-employed profits, rental profits, pension income, savings interest and dividends. From that you take off gross Gift Aid donations and gross pension contributions paid by relief at source, plus some trading losses. Net pay contributions and salary sacrifice already reduce employment income, so they are taken off without a claim. Employer contributions are not your income at all. GOV.UK's ${h.src('gov_relief', 'pension tax relief page')} explains the relief side, and HMRC's ${h.src('hmrc_taper', 'tapered annual allowance steps')} use a related figure, adjusted income, for a different test.</p>
<h2>Three ways to make the contribution</h2>
<h3>Salary or bonus sacrifice</h3>
<p>The cleanest route. Your contractual pay falls by the amount, your payroll tax and NI follow, and adjusted net income falls without any claim. It must be agreed before the pay or bonus is earned. From 6 April 2029, NI will apply to employee sacrifice above ${h.m(h.P.sacrifice.niCap)} a year under announced plans, but the Income Tax effect, which is what clears the 60% band, stays.</p>
<h3>Net pay through your workplace scheme</h3>
<p>Raise your percentage, or make an additional voluntary contribution through payroll. The relief comes through your payslip at your marginal rate, including the lost allowance once your tax code catches up. If your code assumes a full allowance, the correction can come through an end-of-year calculation.</p>
<h3>Relief at source or a SIPP</h3>
<p>Pay 80% of the gross amount. With ${h.m(120000)} of income, ${h.m(16000)} paid in becomes ${h.m(ex.gross)} and gives ${h.m(ex.claim)} to claim back through Self Assessment, which restores the allowance in the calculation of your tax. The cost is right, but the relief arrives late; at this income you file a return anyway.</p>
<h2>Timing within the tax year</h2>
<p>The test is on the whole tax year, 6 April to 5 April. A contribution made on 4 April counts in full for the year then ending, even if most of your income came earlier. That makes it possible to wait until a bonus is known before deciding. Payroll contributions must be in a pay run of the same tax year; a SIPP payment must reach the provider by 5 April. Pension savings for the year, including employer money, still need to stay within the ${h.m(h.P.allowances.years['2026/27'].aa)} annual allowance plus carry forward. Above ${h.m(h.P.allowances.years['2026/27'].threshold)} of threshold income the allowance itself can taper: check it on the ${h.a('annual-allowance-calculator', 'annual allowance calculator')}.</p>
<h2>Childcare and Child Benefit</h2>
<p>Two other lines sit on the same income measure. Tax-Free Childcare stops when you or your partner expect adjusted net income above ${h.m(100000)} (${h.src('gov_tfc', 'GOV.UK, eligibility')}), and the High Income Child Benefit Charge has taken back all Child Benefit long before, at ${h.m(h.P.childBenefit.hicbcTo)}. A family on ${h.m(104000)} with two children in paid childcare can gain more from keeping Tax-Free Childcare than from the tax relief itself. The ${h.a('salary-sacrifice-child-benefit', 'Child Benefit guide')} covers the lower band.</p>
<h2>Worked pages</h2>
<p>The ${h.a('pension-tax-relief-on-100000-salary', '£100,000 page')} shows the effect of a rise from that point, and the ${h.a('pension-tax-relief-on-125000-salary', '£125,000 page')} the contribution that restores the whole allowance. The calculator above gives the figure for your own income.</p>
<h2>Three examples</h2>
<p>A senior nurse manager earns ${h.m(98000)} and is told in February that she will get a ${h.m(8000)} bonus in March. Without action, her adjusted net income becomes ${h.m(106000)} and she loses ${h.m(3000)} of Personal Allowance. Sacrificing ${h.m(6000)} of the bonus keeps her at ${h.m(100000)}; the other ${h.m(2000)} reaches her pay. A software contractor with profits of ${h.m(118000)} pays ${h.m(14400)} into a SIPP before 5 April; it becomes ${h.m(18000)} gross, brings him back to ${h.m(100000)} and gives a large repayment through his return. A landlord with a salary of ${h.m(90000)} and rental profits of ${h.m(20000)} has adjusted net income of ${h.m(110000)}: rental profit counts, so ${h.m(10000)} gross into a pension restores the full allowance.</p>
<h2>When it may not be worth it</h2>
<p>Pension money is locked away until the minimum pension age, ${h.P.minimumPensionAge.now} now and ${h.P.minimumPensionAge.from2028} from ${h.date(h.P.minimumPensionAge.changeDate)}. If you need the cash within a few years, 60% relief does not change that. And the income is taxed when you draw it: a quarter can usually come out tax free, the rest at your rate in retirement, often 20%. The net gain is the difference between the relief now and the tax later, which for most people in this band is still large.</p>
<h2>Mistakes to avoid</h2>
<ul><li>Counting the net amount paid into a SIPP rather than the gross. Only the gross figure reduces adjusted net income.</li><li>Forgetting benefits in kind. A company car or private medical cover counts towards adjusted net income.</li><li>Leaving the payment until after 5 April. It then counts for the next tax year.</li><li>Missing the annual allowance. A large contribution plus employer money can exceed ${h.m(h.P.allowances.years['2026/27'].aa)}; carry forward may help.</li></ul>
<h2>The NI side for employees</h2>
<p>National Insurance does not follow the Personal Allowance taper. Employee NI above ${h.m(h.P.ni.upperEarningsLimit)} is 2% whatever your income, so the effective rate between ${h.m(100000)} and ${h.m(h.I.paZeroAt)} is 62% on earnings. Salary sacrifice removes the 2% as well, so a sacrifice in this band saves 62p in every pound for the employee, plus 15p for the employer, until the NI cap starts in April 2029. Net pay and relief at source save 60p. For a self-employed person, Class 4 NI is not reduced by pension contributions at all.</p>
<h2>Self-employed and directors</h2>
<p>A sole trader cannot sacrifice salary, so the route is a personal pension or SIPP by relief at source, paid before 5 April and reported on the return. Profits are known late, which is why many make a single payment in March. A company director can have the company pay an employer contribution, which never enters adjusted net income at all, rather than taking a bonus or dividend that would push income above ${h.m(100000)}. Employer contributions are not limited by the director's earnings, only by the annual allowance and the usual test that the payment is made for the purposes of the business.</p>
<h2>Checking the result</h2>
<p>After the tax year, your Self Assessment calculation or your end-of-year statement from HMRC should show a Personal Allowance of ${h.m(h.I.personalAllowance)} if the contribution worked. If it shows less, check that the gross relief at source figure was entered, and that all income was counted. A shortfall of a few hundred pounds is often a benefit in kind or interest that was not expected.</p>`;
  },
});
