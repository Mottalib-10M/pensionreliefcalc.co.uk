import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'pension-tax-relief-on-60000-salary',
  group: 'salary',
  order: 20,
  tool: { kind: 'tool:relief', props: { salary: 60000, amount: 7800, method: 0 } },
  related: ['salary-sacrifice-child-benefit', 'higher-rate-pension-tax-relief', 'pension-tax-relief-on-80000-salary', 'pension-tax-relief-on-50000-salary'],
  sources: ['gov_relief', 'hmrc_claim', 'gov_hicbc', 'gov_rates'],
  slug: 'pension-tax-relief-on-60000-salary',
  nav: 'Relief on a £60,000 salary',
  card: 'Higher rate relief on the slice above £50,270, and why £9,730 is the contribution that matters on this salary.',
  title: 'Pension Tax Relief on £60,000: The 40% Slice and the Claim',
  description: 'Pension tax relief on a £60,000 salary for 2026/27: 40% on the slice above £50,270, the amount to claim from HMRC, and the Child Benefit charge to avoid.',
  h1: 'Pension tax relief on a £60,000 salary',
  intro: 'The calculator opens on £60,000 with £7,800 paid into a relief at source pension, which puts £9,750 gross in the pot. Change the amount to see where the 40% relief stops.',
  resume: (h) => {
    const slice = 60000 - h.higherStart;
    const r = h.relief({ salary: 60000, method: 'ras', amount: 7800 });
    return `On ${h.m(60000)} the top ${h.m(slice)} of salary, everything above ${h.m(h.higherStart)}, is taxed at 40% in England, Wales and Northern Ireland in ${h.P.taxYear}. Gross pension contributions up to that amount get 40% relief; beyond it, relief drops back to 20%. Paid by relief at source, ${h.m(7800)} from your bank becomes ${h.m(r.gross)} in the pension with the provider's ${h.m(r.providerTopUp)}, and you then claim ${h.m(r.claim)} more from HMRC (${h.src('hmrc_claim', 'HMRC, claim tax relief on private pension payments')}), so the real cost is ${h.m(r.netCost)}. This matches the worked example on ${h.src('gov_relief', 'GOV.UK')}, where someone earning ${h.m(60270)} gets extra relief on ${h.m(10000)} only. A parent receiving Child Benefit gains more: adjusted net income of ${h.m(60000)} is exactly where the High Income Child Benefit Charge begins, and every gross pound into a pension above it lowers both the tax and the charge.`;
  },
  faqs: (h) => [
    { q: 'How much should I pay into my pension on £60,000 to get full 40% relief?', a: `Up to ${h.m(60000 - h.higherStart)} gross a year, which is ${h.m((60000 - h.higherStart) * 0.8)} paid from your bank into a relief at source scheme. That brings your taxable income back to ${h.m(h.higherStart)}. More is still relieved, but at 20%. Employer contributions do not count towards this figure, because they are not part of your taxable salary.` },
    { q: 'Why did my pension provider only add 20% on a £60,000 salary?', a: 'Providers can only claim basic rate relief from HMRC, whatever you earn. The other 20% on the slice above the higher rate threshold is yours to claim, through Self Assessment or HMRC’s online service, as a repayment or a change to your tax code. Workplace schemes using net pay give the full relief through payroll, with nothing to claim.' },
    { q: 'Does salary sacrifice beat relief at source on £60,000?', a: `By the employee NI, which is only 2% on salary above ${h.m(h.P.ni.upperEarningsLimit)}. Sacrificing ${h.m(60000 - h.higherStart)} saves ${h.m(h.relief({ salary: 60000, method: 'sacrifice', amount: 60000 - h.higherStart }).niSaved)} of NI on top of the same Income Tax relief. The bigger gain is the employer’s 15% if it is shared with you, and that part shrinks above the ${h.m(h.P.sacrifice.niCap)} cap from April 2029.` },
  ],
  body: (h) => {
    const slice = 60000 - h.higherStart;
    const ex = h.relief({ salary: 60000, method: 'ras', amount: 7800 });
    const g = [2000, 5000, slice, 12000, 15000];
    const kids = [1, 2, 3].map((k) => { const cb = h.R.childBenefitYear(k); return [String(k), h.m(cb), h.m(h.R.hicbc(60000, k)), h.m(h.R.hicbc(70000, k)), h.m(h.R.hicbc(70000 - slice, k))]; });
    return `<h2>The cost of each contribution</h2>
${h.methodsTable(60000, g)}
<p>The relief rate holds at 40% up to ${h.m(slice)} gross, then the average falls as further pounds are relieved at 20%. Net pay and relief at source end at the same cost once the claim is made. With relief at source the difference is timing: the extra relief comes back after the tax year, or through a new tax code.</p>
<h2>A raise to £70,000 and Child Benefit</h2>
<p>The High Income Child Benefit Charge takes back 1% of Child Benefit for every ${h.m(h.P.childBenefit.hicbcStep)} of adjusted net income above ${h.m(h.P.childBenefit.hicbcFrom)}, all of it at ${h.m(h.P.childBenefit.hicbcTo)} (${h.src('gov_hicbc', 'GOV.UK')}). At ${h.m(60000)} the charge is nil. A raise to ${h.m(70000)} would bring half of it back, but a gross contribution of ${h.m(slice)} lowers adjusted net income to ${h.m(70000 - slice)} and keeps the charge small:</p>
${h.table(['Children', 'Child Benefit a year', 'Charge at £60,000', 'At £70,000', `At £70,000 less ${h.m(slice)} gross`], kids, `Child Benefit at ${h.m2(h.P.childBenefit.eldestWeekly)} a week for the eldest child and ${h.m2(h.P.childBenefit.otherWeekly)} for each other child, ${h.P.taxYear}.`, ['l', 'r', 'r', 'r', 'r'])}
<p>The ${h.a('salary-sacrifice-child-benefit', 'Child Benefit guide')} works through the zone between ${h.m(h.P.childBenefit.hicbcFrom)} and ${h.m(h.P.childBenefit.hicbcTo)} in detail. The ${h.a('higher-rate-pension-tax-relief', 'higher rate relief guide')} shows how to make the claim and how far back it can go. At ${h.m(80000)} the whole salary above ${h.m(h.higherStart)} is in the 40% band, which is the subject of the ${h.a('pension-tax-relief-on-80000-salary', '£80,000 page')}.</p>
<h2>Claiming the extra pension tax relief</h2>
<p>A relief at source member on ${h.m(60000)} who pays ${h.m(7800)} has ${h.m(ex.claim)} to claim, on top of the ${h.m(ex.providerTopUp)} the provider adds. Without a Self Assessment return, the claim goes to HMRC online, by phone or by letter, with the gross amount paid in the tax year and the scheme's name. HMRC either repays the tax or changes the tax code, and it can keep the change for the following years if the contributions continue. With a return, the gross figure goes in the pensions section and the basic rate band is widened automatically. Claims can go back four years, so someone who has paid into a SIPP since 2022/23 without claiming can still recover the relief for 2022/23 until 5 April 2027. Net pay members on this salary need do nothing: the full 40% comes through the payslip.</p>
<p>Salary sacrifice on this salary has one more effect worth knowing: because the sacrificed amount never becomes pay, it also reduces the earnings used for student loan repayments, which are 9% above the plan threshold for most graduates. The calculator leaves that out, so for a graduate repaying a loan the true saving is larger than shown.</p>`;
  },
});
