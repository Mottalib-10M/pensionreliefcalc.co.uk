import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'pension-tax-relief-on-100000-salary',
  group: 'salary',
  order: 40,
  tool: { kind: 'tool:relief', props: { salary: 100000, amount: 8000, method: 0 } },
  related: ['pension-contributions-over-100k', 'pension-tax-relief-on-125000-salary', 'pension-tax-relief-on-80000-salary', 'higher-rate-pension-tax-relief'],
  sources: ['gov_rates', 'gov_relief', 'hmrc_claim', 'leg_fa04_190', 'gov_tfc', 'gov_ss2029'],
  slug: 'pension-tax-relief-on-100000-salary',
  nav: 'Relief on a £100,000 salary',
  card: 'Exactly at the start of the Personal Allowance taper: why a pay rise from here is worth so little unless it goes to the pension.',
  title: 'Pension Tax Relief on £100,000: Where the 60% Band Begins',
  description: 'Pension tax relief on £100,000 in 2026/27: 40% on contributions today, 60% on any rise or bonus paid into a pension, and keeping adjusted income at £100,000.',
  h1: 'Pension tax relief on a £100,000 salary',
  intro: 'The calculator opens on £100,000 with £8,000 paid into a relief at source pension. Raise the salary by a few thousand pounds to watch the relief climb as the Personal Allowance taper starts.',
  resume: (h) => {
    const r = h.relief({ salary: 100000, method: 'ras', amount: 8000 });
    const up = h.relief({ salary: 110000, method: 'ras', amount: 8000 });
    return `A salary of exactly ${h.m(100000)} keeps the full Personal Allowance of ${h.m(h.I.personalAllowance)}, because the taper only starts above that figure: ${h.m(1)} of allowance is lost for every ${h.m(2)} of adjusted net income over ${h.m(100000)}, until none is left at ${h.m(h.I.paZeroAt)} (${h.src('gov_rates', 'GOV.UK')}). At ${h.m(100000)} itself a contribution is relieved at 40%: ${h.m(8000)} paid by relief at source becomes ${h.m(r.gross)} and brings back ${h.m(r.claim)}, for a real cost of ${h.m(r.netCost)}. The picture changes with any rise. At ${h.m(110000)} the same payment brings back ${h.m(up.claim)}, because it restores ${h.m(up.paAfter - up.paBefore)} of Personal Allowance as well as removing 40% tax: ${h.pc(up.effectiveRate)} relief in all. Adjusted net income is reduced by gross pension contributions, by relief at source, net pay or salary sacrifice, so a bonus paid into the pension avoids the taper entirely.`;
  },
  faqs: (h) => [
    { q: 'Does a pay rise above £100,000 really cost 60% tax?', a: `On income between ${h.m(100000)} and ${h.m(h.I.paZeroAt)}, yes, before NI: each extra ${h.m(100)} brings ${h.m(40)} of higher rate tax and removes ${h.m(50)} of allowance, which costs another ${h.m(20)}. With 2% employee NI the take-home share of each pound is 38p. A pension contribution of the same size reverses all of it, which is why relief there is 60%.` },
    { q: 'What counts as adjusted net income for the taper?', a: 'Your total taxable income, salary, bonus, benefits in kind, profits, rent, interest and dividends, less gross pension contributions paid by relief at source and gross Gift Aid. Net pay contributions and salary sacrifice already reduce taxable pay, so they lower it automatically. Employer contributions are not part of your income at all.' },
    { q: 'Should I sacrifice my bonus if it takes me over £100,000?', a: `If you can afford to lock the money away, a bonus sacrifice keeps adjusted net income at ${h.m(100000)} and saves 40% tax, the lost allowance and 2% NI, often with part of the employer’s 15% on top. Check that the scheme allows bonus sacrifice before the bonus is awarded, since it cannot be backdated.` },
  ],
  body: (h) => {
    const sal = [100000, 105000, 110000, 115000, 120000, 125140];
    const rows = sal.map((s) => { const g = h.R.contributionToReach100k(s); const r = h.relief({ salary: s, method: 'netpay', amount: g }); return [h.m(s), h.m(g), h.m(r.incomeTaxSaved), h.m(r.paAfter - r.paBefore), g > 0 ? h.pc(r.effectiveRate) : '40% on new money']; });
    const childcare = h.relief({ salary: 104000, method: 'sacrifice', amount: 4000 });
    return `<h2>The contribution that brings income back to ${h.m(100000)}</h2>
${h.table(['Adjusted net income', 'Gross contribution needed', 'Income Tax saved', 'Allowance won back', 'Relief'], rows, `${h.P.taxYear}, England, Wales or Northern Ireland. Net pay or salary sacrifice; by relief at source pay 80% of the gross figure and claim the rest.`, ['l', 'r', 'r', 'r', 'r'])}
<p>The relief rate is 60% at every step, because each gross pound saves 40p of higher rate tax and wins back 50p of allowance taxed at 40%. The figures stop at ${h.m(h.I.paZeroAt)}, where the allowance is gone entirely and the additional rate begins.</p>
<h2>Childcare support at the same line</h2>
<p>The ${h.m(100000)} line is also the limit for Tax-Free Childcare: a parent, or their partner, whose expected adjusted net income for the year is over it cannot get the scheme (${h.src('gov_tfc', 'GOV.UK, Tax-Free Childcare eligibility')}). Keeping adjusted net income at or below ${h.m(100000)} through pension contributions keeps that support, which can be worth more than the tax for a family paying for nursery. On ${h.m(104000)}, sacrificing ${h.m(4000)} costs ${h.m(childcare.netCost)} of take-home pay. ${h.src('gov_ss2029', 'HM Treasury and HMRC’s paper on the April 2029 cap')} confirms that employees who sacrifice salary to keep Tax-Free Childcare or Child Benefit can go on doing so, with NI due above ${h.m(h.P.sacrifice.niCap)}.</p>
<h2>Where to go next</h2>
<p>Contributions by relief at source must be claimed to reduce adjusted net income in the tax calculation, through Self Assessment or ${h.src('hmrc_claim', 'HMRC’s claim service')}. Relief is limited to your earnings for the year (${h.src('leg_fa04_190', 'Finance Act 2004, section 190')}), which is rarely a constraint here. The ${h.a('pension-contributions-over-100k', 'guide to pension contributions over £100,000')} covers timing, bonuses and the end of the taper. The ${h.a('pension-tax-relief-on-125000-salary', '£125,000 page')} shows the case where the whole allowance has gone.</p>
<p>One more case is common at this salary: a bonus paid in March that lifts income above ${h.m(100000)} for a single tax year. A relief at source payment made before 6 April, equal to the gross amount over the line, brings adjusted net income back down for that year once the claim is made. The calculator shows the cost of that payment for any income you enter.</p>
<h2>Net pay, relief at source or sacrifice at this level</h2>
<p>All three methods give the same Income Tax result once any claim is made, because each one reduces adjusted net income by the gross contribution. The differences are in NI and in timing. Sacrifice saves 2% employee NI and up to 15% for the employer; net pay gives the relief on payday; relief at source needs a claim, and until it is processed your tax code may collect too much. For a payment meant to keep income under ${h.m(100000)}, the method that acts within the same tax year without paperwork is often the simplest.</p>`;
  },
});
