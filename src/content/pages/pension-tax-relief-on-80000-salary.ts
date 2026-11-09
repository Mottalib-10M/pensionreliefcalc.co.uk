import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'pension-tax-relief-on-80000-salary',
  group: 'salary',
  order: 30,
  tool: { kind: 'tool:relief', props: { salary: 80000, amount: 12000, method: 1 } },
  related: ['pension-tax-relief-on-100000-salary', 'scottish-pension-tax-relief', 'salary-sacrifice-2029-cap', 'pension-tax-relief-on-60000-salary'],
  sources: ['gov_rates', 'gov_scot', 'hmrc_employer', 'gov_ss2029'],
  slug: 'pension-tax-relief-on-80000-salary',
  nav: 'Relief on an £80,000 salary',
  card: 'Nearly £30,000 of salary in the 40% band: what a large contribution costs, and Scotland’s 45% advanced rate.',
  title: 'Pension Tax Relief on £80,000: Room for 40% and 45% Relief',
  description: 'Pension tax relief on an £80,000 salary in 2026/27: £29,730 of room at 40%, 45% on part of it in Scotland, and what sacrifice saves now and from April 2029.',
  h1: 'Pension tax relief on an £80,000 salary',
  intro: 'The calculator opens on £80,000 with £12,000 a year through a net pay workplace scheme. Switch to relief at source, sacrifice or Scotland to compare the cost of the same contribution.',
  resume: (h) => {
    const room = 80000 - h.higherStart;
    const r = h.relief({ salary: 80000, method: 'netpay', amount: 12000 });
    const s = h.relief({ salary: 80000, nation: 'scotland', method: 'netpay', amount: 12000 });
    return `At ${h.m(80000)} the salary above ${h.m(h.higherStart)}, ${h.m(room)} of it, is taxed at 40% in England, Wales and Northern Ireland in ${h.P.taxYear}, so a contribution of that size or less is relieved at 40% throughout. Through a net pay scheme, ${h.m(12000)} a year saves ${h.m(r.incomeTaxSaved)} of Income Tax straight away and costs ${h.m(r.netCost)} of take-home pay. A Scottish taxpayer on ${h.m(80000)} pays the 45% advanced rate on income above ${h.m(75000)} and 42% below it (${h.src('gov_scot', 'GOV.UK, Scottish rates')}): the same contribution saves ${h.m(s.incomeTaxSaved)} and costs ${h.m(s.netCost)}. Employee NI here is 2% on salary above ${h.m(h.P.ni.upperEarningsLimit)}, so salary sacrifice adds little for the employee, but the employer saves 15% and may pass some of it on. From April 2029 only the first ${h.m(h.P.sacrifice.niCap)} of sacrifice keeps that NI saving (${h.src('gov_ss2029', 'HM Treasury and HMRC')}), which matters most at this level of contribution.`;
  },
  faqs: (h) => [
    { q: 'What is the best pension contribution on an £80,000 salary?', a: `For tax alone, up to ${h.m(80000 - h.higherStart)} gross gets the full 40% relief, which brings taxable pay down to the basic rate threshold. Whether that suits you depends on what you need in take-home pay and on the annual allowance of ${h.m(h.P.allowances.years['2026/27'].aa)}, which also counts employer money. Contributions above it get 20% relief only.` },
    { q: 'Can I get the extra relief through my tax code on £80,000?', a: 'Yes. If you pay into a personal pension by relief at source and do not file a Self Assessment return, HMRC can include the extra relief in your tax code each year once it knows the amount, so you get it through payroll. If your contributions change, tell HMRC, or the code will give too much or too little.' },
    { q: 'Is it worth asking my employer to share its NI saving?', a: `Often. On ${h.m(12000)} of salary sacrifice the employer saves ${h.m(h.relief({ salary: 80000, method: 'sacrifice', amount: 12000 }).employerNiSaved)} of its own NI a year. Some employers add all of it to your pension, some half, some none. From April 2029 the saving shrinks to the NI on the first ${h.m(h.P.sacrifice.niCap)}, so check any promise in writing.` },
  ],
  body: (h) => {
    const g = [5000, 12000, 20000, 29730, 40000];
    const sc = g.map((x) => { const r = h.R.compareMethods(80000, x, 'scotland'), u = h.R.compareMethods(80000, x); return [h.m(x), h.m(u.netpay.netCost), h.m(r.netpay.netCost), h.pc(u.netpay.effectiveRate), h.pc(r.netpay.effectiveRate)]; });
    const a = h.relief({ salary: 80000, method: 'sacrifice', amount: 12000 }), b = h.relief({ salary: 80000, method: 'sacrifice', amount: 12000, after2029: true });
    return `<h2>All three methods at ${h.m(80000)}</h2>
${h.methodsTable(80000, g)}
<p>Up to ${h.m(29730)} gross the relief rate stays at 40%, and the last row shows it drop once contributions reach into income taxed at 20%. The gap between net pay and sacrifice is the 2% employee NI, small at this salary. The gap between now and April 2029 grows with the size of the sacrifice.</p>
<h2>England against Scotland on the same salary</h2>
${h.table(['Into the pension', 'Cost, rest of UK', 'Cost, Scotland', 'Relief, rest of UK', 'Relief, Scotland'], sc, `Net pay arrangement, ${h.P.taxYear}. Scottish bands from GOV.UK; relief equals the Income Tax saved.`, ['l', 'r', 'r', 'r', 'r'])}
<p>The first ${h.m(80000 - 75000)} of a Scottish contribution is relieved at 45%, the next part at 42%, then 21% in the intermediate band. A Scottish taxpayer therefore saves more on a moderate contribution but reaches lower rates sooner on a large one.</p>
<h2>The 2029 change at this salary</h2>
<p>Sacrificing ${h.m(12000)} a year saves you ${h.m(a.niSaved)} of NI now and ${h.m(b.niSaved)} from 6 April 2029; your employer's saving falls from ${h.m(a.employerNiSaved)} to ${h.m(b.employerNiSaved)}. Income Tax relief does not change. For a contribution of this size the employee loses little, but the employer loses most of its incentive, which is why some may stop topping up. The ${h.a('salary-sacrifice-2029-cap', 'guide to the 2029 cap')} sets out the choices. At ${h.m(100000)} a new effect starts, explained on the ${h.a('pension-tax-relief-on-100000-salary', '£100,000 page')}.</p>
<h2>Timing a contribution</h2>
<p>Relief is given for the tax year in which the payment reaches the scheme. Someone on ${h.m(80000)} who expects a pay rise next year can split a large payment across both years to stay within the 40% slice each time, rather than paying it all in one year where part would only get 20%. For relief at source, payments made by 5 April count for the year then ending, and the claim can follow later. For net pay and sacrifice, the deduction must be in a payroll run of that tax year. A Scottish taxpayer should run the calculator in both modes to see the effect of the 45% advanced rate, which starts at ${h.m(75001)} of income.</p>
<p>If both partners in a couple earn, the one with more income in the 40% band gets more relief per pound. A couple on ${h.m(80000)} and ${h.m(30000)} gets 40% on the first partner's contributions and 20% on the second's, so moving savings to the higher earner's pension raises the relief without changing what the household pays in.</p>`;
  },
});
