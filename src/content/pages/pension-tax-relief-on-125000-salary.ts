import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'pension-tax-relief-on-125000-salary',
  group: 'salary',
  order: 50,
  tool: { kind: 'tool:relief', props: { salary: 125000, amount: 25000, method: 2 } },
  related: ['pension-contributions-over-100k', 'pension-tax-relief-on-150000-salary', 'carry-forward-calculator', 'pension-tax-relief-on-100000-salary'],
  sources: ['gov_rates', 'hmrc_employer', 'hmrc_cf', 'leg_fa04_228a'],
  slug: 'pension-tax-relief-on-125000-salary',
  nav: 'Relief on a £125,000 salary',
  card: 'No Personal Allowance left: a £25,000 contribution wins all of it back and is relieved at about 60%.',
  title: 'Pension Tax Relief on £125,000: Winning Back the Allowance',
  description: 'Pension tax relief on £125,000 for 2026/27: almost no Personal Allowance left, a £25,000 contribution that wins it back at 60%, and carry forward above that.',
  h1: 'Pension tax relief on a £125,000 salary',
  intro: 'The calculator opens on £125,000 with £25,000 of salary sacrifice, roughly the amount that restores the whole Personal Allowance. Lower it, or switch method, to see the relief move.',
  resume: (h) => {
    const g = h.R.contributionToReach100k(125000);
    const r = h.relief({ salary: 125000, method: 'netpay', amount: g });
    return `At ${h.m(125000)} almost the whole Personal Allowance has gone: it falls by ${h.m(1)} for every ${h.m(2)} of adjusted net income above ${h.m(100000)} and reaches nothing at ${h.m(h.I.paZeroAt)} (${h.src('gov_rates', 'GOV.UK')}). Only ${h.m(h.T.personalAllowance(125000))} of it is left. A gross pension contribution of ${h.m(g)} brings adjusted net income back to ${h.m(100000)}, wins back ${h.m(r.paAfter - r.paBefore)} of allowance and saves ${h.m(r.incomeTaxSaved)} of Income Tax: a relief rate of ${h.pc(r.effectiveRate)}. Through salary sacrifice the employee also saves 2% NI, and the employer 15%. Beyond ${h.m(g)}, further contributions get 40% relief, as long as all pension savings stay within the ${h.m(h.P.allowances.years['2026/27'].aa)} annual allowance plus any unused allowance carried forward from the three previous years (${h.src('hmrc_cf', 'HMRC, unused annual allowances')}). Threshold income here is far below the ${h.m(h.P.allowances.years['2026/27'].threshold)} at which the annual allowance can be tapered, so the full allowance is available.`;
  },
  faqs: (h) => [
    { q: 'How much should I put in my pension on £125,000 to get my allowance back?', a: `${h.m(h.R.contributionToReach100k(125000))} gross in ${h.P.taxYear}, the amount by which your adjusted net income exceeds ${h.m(100000)}. By relief at source that is ${h.m(h.R.contributionToReach100k(125000) * 0.8)} from your bank, with the rest claimed back. Employer contributions do not reduce your adjusted net income, unless they replace salary through a sacrifice.` },
    { q: 'Is the 60% relief real or just a way of describing it?', a: `It is real money. At ${h.m(125000)} you pay 40% on the top slice and lose allowance that would have saved another 20%. Taking that slice out of income through a pension removes both, so ${h.m(10000)} gross costs ${h.m(4000)} of take-home pay. When the pension is drawn later, the income is taxed, usually at a lower rate.` },
    { q: 'Can I pay in more than £60,000 on this salary?', a: 'Yes, if you have unused annual allowance from the three earlier years and you were a member of a registered scheme then. Personal contributions also need earnings at least equal to the gross amount, which £125,000 gives. Above £25,140 the extra contributions are relieved at 40%, not 60%.' },
  ],
  body: (h) => {
    const g = [5000, 10000, 15000, 25140, 35000, 60000];
    const rows = g.map((x) => { const r = h.relief({ salary: 125000, method: 'netpay', amount: x }); const s = h.relief({ salary: 125000, method: 'sacrifice', amount: x }); return [h.m(x), h.m(r.incomeTaxSaved), h.m(r.paAfter - r.paBefore), h.m(r.netCost), h.m(s.netCost), h.pc(r.effectiveRate)]; });
    const cf = h.A.carryForward([{ year: '2023/24', savings: 20000, member: true }, { year: '2024/25', savings: 25000, member: true }, { year: '2025/26', savings: 30000, member: true }], 100000);
    return `<h2>Relief by size of contribution</h2>
${h.table(['Gross contribution', 'Income Tax saved', 'Allowance won back', 'Net pay cost', 'Sacrifice cost', 'Relief'], rows, `Salary of ${h.m(125000)}, ${h.P.taxYear}, England, Wales or Northern Ireland. Relief is the Income Tax saved over the gross contribution.`, ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>The relief rate stays at 60% up to ${h.m(25140)} because every pound in that range sits in the taper. After that it falls toward 40% as the extra contributions come out of income taxed at the higher rate with a full allowance already restored. At ${h.m(60000)}, the full standard annual allowance, the average relief is still close to half.</p>
<h2>Using carry forward for a bigger payment</h2>
<p>Someone on ${h.m(125000)} who saved ${h.m(20000)}, ${h.m(25000)} and ${h.m(30000)} in the last three tax years, all with a ${h.m(60000)} allowance, has ${h.m(cf.available)} of allowance available in ${h.P.taxYear}. A payment of ${h.m(100000)} would fit, using ${h.m(cf.rows[0].used)} from 2023/24 first under ${h.src('leg_fa04_228a', 'section 228A of the Finance Act 2004')}. Relief on a personal contribution is still capped at earnings of ${h.m(125000)}.</p>
<h2>NI at this salary</h2>
<p>Employee NI above the ${h.m(h.P.ni.upperEarningsLimit)} upper earnings limit is 2% (${h.src('hmrc_employer', 'HMRC, rates for employers')}), so sacrifice only shaves a little more off the cost for the employee. The employer saves 15% on every pound sacrificed until April 2029, when the saving stops above ${h.m(h.P.sacrifice.niCap)}. The ${h.a('pension-contributions-over-100k', 'guide to contributions over £100,000')} sets out the timing questions, and the ${h.a('pension-tax-relief-on-150000-salary', '£150,000 page')} looks at relief at the additional rate.</p>
<h2>A Scottish taxpayer on ${h.m(125000)}</h2>
<p>In Scotland the same salary is taxed at 45% between ${h.m(75001)} and ${h.m(h.I.paZeroAt)}, and the Personal Allowance taper works the same way, so relief in the taper band is about 67%, higher still. A contribution that brings adjusted net income back to ${h.m(100000)} saves ${h.m(h.relief({ salary: 125000, nation: 'scotland', method: 'netpay', amount: 25000 }).incomeTaxSaved)} of Scottish Income Tax on ${h.m(25000)} gross. Set the nation field to Scotland in the calculator above to test your own figures.</p>
<h2>Why the method matters less here</h2>
<p>At this income relief at source, net pay and salary sacrifice all give 60% relief in the taper band once the claim is made. Relief at source leaves you to claim 40% of the gross amount yourself through Self Assessment, which is a large sum to wait for: ${h.m(h.relief({ salary: 125000, method: 'ras', amount: 20000 }).claim)} on ${h.m(20000)} paid from the bank. Net pay and sacrifice give the relief on payday. The employer's choice of scheme decides which you can use for workplace money; a SIPP is always relief at source.</p>`;
  },
});
