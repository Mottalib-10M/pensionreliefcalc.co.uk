import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'pension-tax-relief-on-150000-salary',
  group: 'salary',
  order: 60,
  tool: { kind: 'tool:relief', props: { salary: 150000, amount: 20000, method: 0 } },
  related: ['annual-allowance-calculator', 'pension-tax-relief-on-125000-salary', 'higher-rate-pension-tax-relief', 'carry-forward-calculator'],
  sources: ['gov_rates', 'gov_relief', 'hmrc_taper', 'hmrc_claim'],
  slug: 'pension-tax-relief-on-150000-salary',
  nav: 'Relief on a £150,000 salary',
  card: 'Additional rate relief at 45%, a 25% claim on relief at source, and the 60% band that sits just below.',
  title: 'Pension Tax Relief on £150,000: 45% Relief and the Claim',
  description: 'Pension tax relief on £150,000 in 2026/27: 45% on the additional rate slice, 60% below £125,140, the 25% to claim from HMRC, and the annual allowance.',
  h1: 'Pension tax relief on a £150,000 salary',
  intro: 'The calculator opens on £150,000 with £20,000 paid into a relief at source pension. Raise the amount to see the relief pass from the additional rate into the 60% band.',
  resume: (h) => {
    const r = h.relief({ salary: 150000, method: 'ras', amount: 20000 });
    const slice = 150000 - h.I.paZeroAt;
    return `On ${h.m(150000)} the income above ${h.m(h.I.paZeroAt)}, ${h.m(slice)} of it, is taxed at the 45% additional rate in England, Wales and Northern Ireland, and there is no Personal Allowance (${h.src('gov_rates', 'GOV.UK')}). Gross contributions up to ${h.m(slice)} get 45% relief; the next ${h.m(h.I.paZeroAt - 100000)} gets about 60%, because it brings back allowance, and anything beyond that 40%. By relief at source the provider adds 20% and you claim the rest: ${h.m(20000)} from your bank becomes ${h.m(r.gross)} in the pension and gives ${h.m(r.claim)} to claim from HMRC, for a real cost of ${h.m(r.netCost)}, ${h.pc(r.effectiveRate)} relief overall. GOV.UK's guidance gives the additional rate claim as 25% on the part of income taxed at 45% (${h.src('gov_relief', 'pension tax relief')}). The annual allowance is still the full ${h.m(h.P.allowances.years['2026/27'].aa)} on this salary unless other income or employer contributions take threshold income above ${h.m(h.P.allowances.years['2026/27'].threshold)} and adjusted income above ${h.m(h.P.allowances.years['2026/27'].adjusted)}.`;
  },
  faqs: (h) => [
    { q: 'How do I claim 45% pension relief?', a: 'If you pay into a relief at source pension, your provider adds 20% and you claim the further 25% on the part taxed at the additional rate, and 20% on any part taxed at 40%, through your Self Assessment return. At this income you are almost always in Self Assessment already. Workplace net pay schemes give the full relief through payroll without a claim.' },
    { q: 'Will my annual allowance be tapered on £150,000?', a: `Not from salary alone. The taper needs threshold income above ${h.m(h.P.allowances.years['2026/27'].threshold)} as well as adjusted income above ${h.m(h.P.allowances.years['2026/27'].adjusted)}. A large bonus, rental profits, dividends or a sale of shares can change that in a particular year, so check both figures on the annual allowance calculator before making a large payment.` },
    { q: 'Is it better to use salary sacrifice at £150,000?', a: `For the employee, sacrifice adds only the 2% NI on salary above ${h.m(h.P.ni.upperEarningsLimit)}. For the employer it saves 15%, which some pass on. A sacrifice also lowers your salary for tax without any claim, which helps cash flow. From April 2029 NI will apply above ${h.m(h.P.sacrifice.niCap)} a year of sacrifice, so the extra gain shrinks.` },
  ],
  body: (h) => {
    const g = [10000, 24860, 35000, 50000, 60000];
    const rows = g.map((x) => { const r = h.relief({ salary: 150000, method: 'ras', amount: x * 0.8 }); return [h.m(x), h.m(x * 0.8), h.m(r.providerTopUp), h.m(r.claim), h.m(r.netCost), h.pc(r.effectiveRate)]; });
    const sc = h.relief({ salary: 150000, nation: 'scotland', method: 'ras', amount: 16000 });
    return `<h2>Relief at source in three bands</h2>
${h.table(['Gross into the pension', 'Paid from your bank', 'Added by provider', 'Claimed from HMRC', 'Real cost', 'Relief'], rows, `Salary of ${h.m(150000)}, ${h.P.taxYear}, England, Wales or Northern Ireland, relief at source.`, ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>The first ${h.m(24860)} gross is relieved at 45%, which is the additional rate slice. The next ${h.m(25140)} is relieved at 60% because it restores the Personal Allowance, so the average rate actually rises at first as the contribution grows. Past ${h.m(50000)} the extra relief is 40%. A contribution of ${h.m(50000)} gross therefore costs a little over half of its face value.</p>
<h2>A Scottish taxpayer on ${h.m(150000)}</h2>
<p>The top rate in Scotland is 48%, and the extra relief claimed on it is 28%. Paying ${h.m(16000)} from the bank gives ${h.m(sc.gross)} in the pension and a claim of ${h.m(sc.claim)}, against ${h.m(h.relief({ salary: 150000, method: 'ras', amount: 16000 }).claim)} elsewhere in the UK. The ${h.a('higher-rate-pension-tax-relief', 'higher rate relief guide')} lists the rates.</p>
<h2>The checks before a large payment</h2>
<ol><li>Earnings: relief only on gross personal contributions up to ${h.m(150000)}.</li><li>Annual allowance: ${h.m(h.P.allowances.years['2026/27'].aa)} plus carry forward, with both taper tests on ${h.src('hmrc_taper', 'HMRC’s steps')}.</li><li>Timing: the payment counts in the tax year it reaches the scheme, so a payment on 5 April counts for that year and one on 6 April for the next.</li><li>The claim: through Self Assessment or ${h.src('hmrc_claim', 'HMRC’s service')}, up to four years back.</li></ol>
<p>The ${h.a('annual-allowance-calculator', 'annual allowance calculator')} and the ${h.a('carry-forward-calculator', 'carry forward calculator')} cover the second check; the ${h.a('pension-tax-relief-on-125000-salary', '£125,000 page')} shows the 60% band on its own.</p>
<p>A final point on cash flow: by relief at source the extra relief only arrives after the return is filed, often many months after the payment. A sacrifice or a net pay scheme gives the full relief in the same month. For a large one-off payment, ask whether the employer can take it through payroll as a bonus sacrifice instead.</p>
<h2>Gift Aid and pensions at the same income</h2>
<p>Gift Aid donations extend the basic rate band and reduce adjusted net income in the same way as relief at source pension contributions, so they also earn higher and additional rate relief. A donor and saver on ${h.m(150000)} should count both when working out how far the Personal Allowance has been restored. The calculator only counts pension contributions; add gross Gift Aid to the contribution field to see the combined effect on Income Tax.</p>`;
  },
});
