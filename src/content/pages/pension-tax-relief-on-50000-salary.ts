import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'pension-tax-relief-on-50000-salary',
  group: 'salary',
  order: 10,
  tool: { kind: 'tool:relief', props: { salary: 50000, amount: 2400, method: 0 } },
  related: ['pension-tax-relief-on-60000-salary', 'relief-at-source-vs-net-pay', 'scottish-pension-tax-relief', 'salary-sacrifice-calculator'],
  sources: ['gov_rates', 'gov_relief', 'gov_scot', 'hmrc_employer'],
  slug: 'pension-tax-relief-on-50000-salary',
  nav: 'Relief on a £50,000 salary',
  card: 'Just under the higher rate threshold: why relief is 20% in England and up to 42% in Scotland on the same salary.',
  title: 'Pension Tax Relief on £50,000: 20% or 42% in Scotland',
  description: 'Pension tax relief on a £50,000 salary in 2026/27: 20% relief in England, Wales and Northern Ireland, 42% on part of it in Scotland, and NI saved by sacrifice',
  h1: 'Pension tax relief on a £50,000 salary',
  intro: 'The calculator opens on £50,000 with £2,400 a year paid into a relief at source pension. Change the method or choose Scotland to see how far the same salary can move the relief.',
  resume: (h) => {
    const r = h.relief({ salary: 50000, method: 'ras', amount: 2400 });
    const s = h.relief({ salary: 50000, nation: 'scotland', method: 'ras', amount: 2400 });
    return `A salary of ${h.m(50000)} sits ${h.m(h.higherStart - 50000)} below the higher rate threshold of ${h.m(h.higherStart)} that applies in England, Wales and Northern Ireland in ${h.P.taxYear} (${h.src('gov_rates', 'GOV.UK, Income Tax rates')}). All of it is taxed at 20% at most, so pension contributions get 20% relief and nothing more: ${h.m(2400)} paid by relief at source becomes ${h.m(r.gross)} in the pension and there is nothing to claim back. A Scottish taxpayer on the same salary is already in the 42% higher rate, which starts at ${h.m(43663)} (${h.src('gov_scot', 'GOV.UK, Scottish Income Tax')}). The same contribution then earns extra relief of ${h.m(s.claim)}, claimed from HMRC, and costs ${h.m(s.netCost)} instead of ${h.m(r.netCost)}. Through salary sacrifice an English taxpayer also saves 8% employee NI on the amount, since ${h.m(50000)} is below the ${h.m(h.P.ni.upperEarningsLimit)} upper earnings limit, which makes this one of the salaries where sacrifice is worth the most per pound.`;
  },
  faqs: (h) => [
    { q: 'Do I get 40% relief on a £50,000 salary?', a: `Not in England, Wales or Northern Ireland, because no part of ${h.m(50000)} is taxed at 40%: the higher rate starts at ${h.m(h.higherStart)}. A bonus or overtime that takes you above it gives 40% relief on contributions up to the amount over the line. In Scotland the answer is different, since the 42% rate starts at ${h.m(43663)}.` },
    { q: 'Is salary sacrifice worth it on £50,000?', a: `Usually yes, while the full NI saving lasts. On ${h.m(50000)} each pound sacrificed saves 20% Income Tax and 8% employee NI, so ${h.m(1000)} into the pension costs ${h.m(h.relief({ salary: 50000, method: 'sacrifice', amount: 1000 }).netCost)} of take-home pay. From April 2029 the NI part is announced to stop above ${h.m(h.P.sacrifice.niCap)} a year of sacrifice.` },
    { q: 'How much does a 5% pension contribution cost on £50,000?', a: `Five per cent is ${h.m(2500)} gross a year. Through net pay it costs ${h.m(h.relief({ salary: 50000, method: 'netpay', amount: 2500 }).netCost)} of take-home pay, the same as relief at source at this salary. Through salary sacrifice it costs ${h.m(h.relief({ salary: 50000, method: 'sacrifice', amount: 2500 }).netCost)}. Many auto-enrolment schemes work on qualifying earnings, a band that leaves out the first few thousand pounds of pay, so check the basis on your payslip.` },
  ],
  body: (h) => {
    const g = [1000, 2500, 5000, 8000, 12000];
    const sc = g.map((x) => { const r = h.R.compareMethods(50000, x, 'scotland'); return [h.m(x), h.m(r.ras.netCost), h.m(r.sacrifice.netCost), h.pc(r.ras.effectiveRate)]; });
    const bonus = h.relief({ salary: 56000, method: 'ras', amount: 4800 });
    return `<h2>Every method, England, Wales and Northern Ireland</h2>
${h.methodsTable(50000, g)}
<p>Relief at source and net pay cost the same here because the whole contribution is relieved at 20%. Salary sacrifice is cheaper by the 8% employee NI, and the April 2029 column shows the cost once NI applies above ${h.m(h.P.sacrifice.niCap)}. Contributions large enough to take taxable pay below ${h.m(h.P.ni.primaryThreshold)} would stop saving NI, but no row here gets close.</p>
<h2>The same salary in Scotland</h2>
${h.table(['Into the pension', 'Relief at source', 'Salary sacrifice', 'Relief (RAS)'], sc, `Cost to take-home pay on ${h.m(50000)}, Scottish taxpayer, ${h.P.taxYear}. NI is UK-wide and unchanged.`, ['l', 'r', 'r', 'r'])}
<p>For a Scottish taxpayer the first ${h.m(50000 - 43662)} or so of contribution is relieved at 42%, and anything beyond it at 21%, the intermediate rate. That is why the relief rate falls as the contribution grows. The 42% part only comes through a claim: the provider still adds 20%, and the extra 22% is claimed from HMRC or comes through a Scottish tax code adjustment.</p>
<h2>A bonus that crosses ${h.m(h.higherStart)}</h2>
<p>With a ${h.m(6000)} bonus, salary reaches ${h.m(56000)} and ${h.m(56000 - h.higherStart)} is taxed at 40%. Paying ${h.m(4800)} by relief at source puts ${h.m(bonus.gross)} in the pension and gives ${h.m(bonus.claim)} to claim back, because the extended basic rate band now covers income that would have been taxed at 40%. Bonus sacrifice, where the employer allows it, gives the same Income Tax result and saves NI at 2% on the part above ${h.m(h.P.ni.upperEarningsLimit)} and 8% below it. The ${h.a('pension-tax-relief-on-60000-salary', '£60,000 page')} goes further into the higher rate band; the ${h.a('scottish-pension-tax-relief', 'Scottish relief guide')} explains how the 1%, 22%, 25% and 28% extra relief is claimed.</p>
<h2>Watching the thresholds</h2>
<p>Three thresholds sit close to this salary. The higher rate starts at ${h.m(h.higherStart)}, the upper earnings limit for employee NI is also ${h.m(h.P.ni.upperEarningsLimit)}, and Child Benefit starts to be clawed back at ${h.m(h.P.childBenefit.hicbcFrom)} of adjusted net income. A pay rise of a few thousand pounds therefore changes the value of every pension pound: below the line, relief is 20% and sacrifice saves 8% NI; above it, relief is 40% but sacrifice saves only 2% NI on the extra. Anyone expecting a raise can use the calculator twice, at today's salary and the new one, to see how much of the raise the pension could absorb at the higher rate. These thresholds are cash figures, so every pay rise brings more earners up to them.</p>`;
  },
});
