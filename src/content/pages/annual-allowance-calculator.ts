import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'annual-allowance-calculator',
  group: 'allowances',
  order: 10,
  tool: { kind: 'tool:aa', props: { income: 280000, own: 30000, method: 1, employer: 20000 } },
  related: ['carry-forward-calculator', 'money-purchase-annual-allowance', 'pension-contributions-over-100k', 'pension-tax-relief-on-150000-salary'],
  sources: ['hmrc_rates', 'hmrc_taper', 'gov_aa', 'hmrc_mpaa'],
  slug: 'annual-allowance-calculator',
  nav: 'Annual allowance calculator',
  card: 'Threshold income, adjusted income, the tapered allowance and any annual allowance charge for 2026/27, in HMRC’s order.',
  title: 'Annual Allowance Calculator 2026/27: Taper and Tax Charge',
  description: 'Annual allowance calculator for 2026/27: threshold and adjusted income in HMRC’s order, the taper down to £10,000, the MPAA and the charge on any excess.',
  h1: 'Annual allowance calculator: your tapered allowance and any charge for 2026/27',
  intro: 'The calculator opens on a high earner with £280,000 of income, a net pay contribution and employer money. Change the figures to see the allowance HMRC’s steps give you and the charge on any excess.',
  resume: (h) => {
    const Y = h.P.allowances.years['2026/27'];
    const a = h.A.annualAllowance({ income: 280000, own: 30000, method: 'netpay', employer: 20000 });
    return `The annual allowance for ${h.P.taxYear} is ${h.m(Y.aa)} of pension savings, counting your own gross contributions and everything your employer pays in. It is tapered only when two tests are both failed: threshold income above ${h.m(Y.threshold)} and adjusted income above ${h.m(Y.adjusted)}. The allowance then falls by ${h.m(1)} for every ${h.m(2)} of adjusted income over ${h.m(Y.adjusted)}, down to ${h.m(Y.minTaper)} (${h.src('hmrc_rates', 'HMRC, pension schemes rates')}). Threshold income is your net income less contributions paid by relief at source, with any salary given up through sacrifice added back; adjusted income adds employer contributions and net pay deductions back on top. With ${h.m(280000)} of income, ${h.m(30000)} through net pay and ${h.m(20000)} from the employer, threshold income is ${h.m(a.thresholdIncome)}, adjusted income ${h.m(a.adjustedIncome)} and the allowance ${h.m(a.aa)}, so ${h.m(a.chargeable)} of the ${h.m(a.savings)} saved is over it: a charge of about ${h.m(a.charge)} unless carry forward covers it.`;
  },
  faqs: (h) => [
    { q: 'Does employer pension money count towards the annual allowance?', a: `Yes. The ${h.m(h.P.allowances.years['2026/27'].aa)} limit covers your own contributions grossed up, your employer's contributions and anything paid by someone else for you. In a defined benefit scheme it is the growth of your promised pension over the year, valued at 16 times the extra pension plus any extra lump sum. Your scheme sends a pension savings statement when one scheme alone takes you over the limit.` },
    { q: 'What income counts as threshold income for the taper?', a: `All taxable income for the year, salary, bonus, profits, rent, dividends and interest, less gross contributions paid by relief at source and some reliefs. Salary given up for pension contributions under a sacrifice arranged after 8 July 2015 is added back. If threshold income is ${h.m(h.P.allowances.years['2026/27'].threshold)} or less, the allowance is not tapered whatever your adjusted income is.` },
    { q: 'How is the annual allowance charge paid?', a: 'You report it on a Self Assessment return for the tax year, and it is added to your income and taxed at your own rates. If the charge is over £2,000 and one scheme alone took you over the standard allowance, you can ask that scheme to pay it from your pension, which reduces your benefits. For 2026/27 the election must reach the scheme by 31 July 2028.' },
    { q: 'Can I avoid the charge with carry forward?', a: `Often. Unused allowance from the three previous tax years can be added to this year's, as long as you were a member of a registered pension scheme in each year you carry from. This year's allowance is used first, then the oldest year. Carry forward does not help with the ${h.m(h.P.allowances.years['2026/27'].mpaa!)} money purchase annual allowance once you have taken flexible income.` },
  ],
  body: (h) => {
    const Y = h.P.allowances.years['2026/27'];
    const incs = [210000, 260000, 280000, 300000, 330000, 360000];
    const rows = incs.map((inc) => { const a = h.A.annualAllowance({ income: inc, own: 20000, method: 'netpay', employer: 20000 }); return [h.m(inc), h.m(a.thresholdIncome), h.m(a.adjustedIncome), h.m(a.aa), h.m(a.chargeable), h.m(a.charge)]; });
    const ss = h.A.annualAllowance({ income: 230000, own: 40000, method: 'sacrifice', employer: 20000 });
    const rs = h.A.annualAllowance({ income: 230000, own: 40000, method: 'ras', employer: 20000 });
    return `<h2>The taper, income by income</h2>
<p>The table keeps the same savings, ${h.m(20000)} through net pay and ${h.m(20000)} from the employer, and moves income up. The taper only bites once adjusted income passes ${h.m(Y.adjusted)}; it reaches its floor of ${h.m(Y.minTaper)} at ${h.m(Y.adjusted + 2 * (Y.aa - Y.minTaper))} of adjusted income.</p>
${h.table(['Income', 'Threshold income', 'Adjusted income', 'Allowance', 'Over it', 'Charge'], rows, `${h.P.taxYear}, England, Wales or Northern Ireland, no carry forward. Steps of ${h.src('hmrc_taper', 'HMRC, work out your tapered annual allowance')}, applied by this site's engine.`, ['l', 'r', 'r', 'r', 'r', 'r'])}
<h2>Why the method of contribution changes threshold income</h2>
<p>Two people with ${h.m(230000)} of salary each put ${h.m(40000)} into a pension and get ${h.m(20000)} from their employer. The one paying by relief at source deducts the contribution from threshold income, which falls to ${h.m(rs.thresholdIncome)}: below ${h.m(Y.threshold)}, so no taper. The one who sacrifices salary has it added back, so threshold income stays at ${h.m(ss.thresholdIncome)}; adjusted income is ${h.m(ss.adjustedIncome)}, under ${h.m(Y.adjusted)}, so here too the allowance stays at ${h.m(ss.aa)}. Move the salary up by ${h.m(40000)} and only the second person is tapered. The calculator asks for the method for that reason.</p>
<h2>The order the calculator follows</h2>
<ol><li>Threshold income: taxable income less relief at source contributions, plus salary sacrificed for pension after 8 July 2015.</li><li>Adjusted income: taxable income plus net pay contributions plus all employer contributions.</li><li>Allowance: ${h.m(Y.aa)}, less half the adjusted income above ${h.m(Y.adjusted)} if both tests fail, never under ${h.m(Y.minTaper)}.</li><li>Money purchase annual allowance of ${h.m(Y.mpaa!)} if you have flexibly accessed a pension; the charge is on the larger excess (${h.src('hmrc_mpaa', 'HMRC, MPAA steps')}).</li><li>Excess over the allowance plus carry forward, taxed as the top slice of your income.</li></ol>
<p>Defined benefit members should enter the pension input amount as employer money. The ${h.a('carry-forward-calculator', 'carry forward calculator')} works out the unused allowance of the three earlier years, and the ${h.a('money-purchase-annual-allowance', 'MPAA guide')} explains what triggers the lower limit. Lump sums are a different allowance, set out on ${h.src('gov_lsa', 'GOV.UK')}.</p>
<h2>Three mistakes that create a surprise charge</h2>
<p>The first is forgetting employer money. A director who pays ${h.m(40000)} personally and has the company pay ${h.m(30000)} has saved ${h.m(70000)}, not ${h.m(40000)}. The second is a defined benefit accrual that jumps in a year of promotion: the pension input amount is based on the rise in promised pension, so a large pay rise in a final salary scheme can use most of the allowance on its own. The third is a one-off income, such as a bonus or a share sale, that takes threshold income above ${h.m(Y.threshold)} for a single year. In each case the charge is due through Self Assessment for the year in which the savings were made, and the scheme's pension savings statement, due by 6 October after the tax year, is the place to check the figures.</p>`;
  },
});
