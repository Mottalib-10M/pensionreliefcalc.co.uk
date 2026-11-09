import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'sipp-calculator',
  group: 'relief',
  order: 50,
  tool: { kind: 'tool:sipp', props: { earnings: 60000, pay: 8000, employer: 3000 } },
  related: ['home', 'higher-rate-pension-tax-relief', 'carry-forward-calculator', 'relief-at-source-vs-net-pay'],
  sources: ['gov_relief', 'leg_fa04_190', 'hmrc_claim', 'hmrc_rates'],
  slug: 'sipp-calculator',
  nav: 'SIPP tax relief calculator',
  card: 'What a payment into a SIPP becomes after the 25% top-up and the extra relief you claim, with the most you can pay in.',
  title: 'SIPP Tax Relief Calculator 2026/27: Top-Up and Claim Back',
  description: 'SIPP tax relief for 2026/27: the 25% the provider adds to your payment, the extra 20 or 25% to claim from HMRC, Scotland included, and the most you can pay in',
  h1: 'SIPP tax relief calculator: what your payment becomes, and what to claim back',
  intro: 'Type your earnings and what you pay into the SIPP from your bank. You get the gross amount in the pension, the extra relief to claim from HMRC and the room left this tax year.',
  resume: (h) => {
    const r = h.relief({ salary: 60000, method: 'ras', amount: 8000 });
    return `A self-invested personal pension works by relief at source. You pay from money already taxed, and the provider claims basic rate relief from HMRC and adds it to the pot: every ${h.m(80)} you pay becomes ${h.m(100)}, a top-up of 25% of your payment. A higher or additional rate taxpayer then claims the rest through Self Assessment or HMRC's online service, which extends the basic rate band by the gross contribution (${h.src('gov_relief', 'GOV.UK, pension tax relief')}). On ${h.m(60000)} of earnings, ${h.m(8000)} paid in becomes ${h.m(r.gross)} in the SIPP, with ${h.m(r.claim)} more to claim, for a real cost of ${h.m(r.netCost)}. Relief is limited to 100% of your relevant UK earnings, or ${h.m(h.P.relief.basicAmount)} gross if you earn less (${h.src('leg_fa04_190', 'Finance Act 2004, section 190')}), and the ${h.m(h.P.allowances.years['2026/27'].aa)} annual allowance counts your employer's money as well.`;
  },
  faqs: (h) => [
    { q: 'How much can I put in a SIPP and still get tax relief?', a: `Up to 100% of your relevant UK earnings for the tax year, gross, so ${h.m(h.P.relief.basicAmount * 0.8)} from your bank becomes ${h.m(h.P.relief.basicAmount)} even with no earnings. Separately, all pension savings for the year, yours and your employer's, should stay within the ${h.m(h.P.allowances.years['2026/27'].aa)} annual allowance or unused allowance carried forward. Rental income, dividends and interest are not relevant earnings, so they do not raise the limit.` },
    { q: 'When does the 25% top-up reach my SIPP?', a: 'The provider claims the basic rate relief from HMRC after it receives your payment. The top-up arrives once HMRC has paid the provider’s claim, usually some weeks after your payment, and it is invested when it lands. Your statement shows it as a separate credit. If you are a higher rate taxpayer, the further relief does not go into the SIPP at all: it comes back to you through your tax.' },
    { q: 'Do I get relief on a SIPP if I pay no Income Tax?', a: `Yes, at the basic rate, on up to ${h.m(h.P.relief.basicAmount)} gross a year. Someone with no earnings, a child or a spouse at home can pay ${h.m(h.P.relief.basicAmountNet)} and see ${h.m(h.P.relief.basicAmount)} invested, and HMRC does not ask for the relief back. Above that amount the relief depends on earnings, so it suits people with a small part-time wage as well.` },
    { q: 'Can I claim higher rate SIPP relief without a Self Assessment return?', a: 'Often, yes. If you are not in Self Assessment, HMRC lets you claim relief on payments into a relief at source pension online, by phone or by letter, and adjusts your tax code or repays you. If you already file a return, you put the gross contributions in the pensions section instead. Claims can go back four tax years from the end of the year in which you paid.' },
  ],
  body: (h) => {
    const rows = [40000, 60000, 80000, 110000, 150000].map((e) => { const r = h.relief({ salary: e, method: 'ras', amount: 8000 }); return [h.m(e), h.m(r.gross), h.m(r.providerTopUp), h.m(r.claim), h.m(r.netCost), h.pc(r.effectiveRate)]; });
    const scot = h.relief({ salary: 60000, nation: 'scotland', method: 'ras', amount: 8000 });
    const low = h.relief({ salary: 2000, method: 'ras', amount: 4000 });
    return `<h2>The same payment at five levels of earnings</h2>
<p>Everyone gets the same 25% added by the provider. What changes with earnings is the claim that follows. A basic rate taxpayer has nothing to claim; a higher rate taxpayer recovers another 20% of the gross amount on the part of income taxed at 40%; at ${h.m(110000)} the contribution also brings back part of the Personal Allowance, which is why the real cost drops so far.</p>
${h.table(['Earnings', 'In the SIPP', 'Added by provider', 'Claim from HMRC', 'Real cost', 'Relief'], rows, `${h.m(8000)} paid from your bank in ${h.P.taxYear}, England, Wales or Northern Ireland. Worked out by this site's engine from HMRC's rates.`, ['l', 'r', 'r', 'r', 'r', 'r'])}
<h2>Scotland, and earners below the limit</h2>
<p>A Scottish taxpayer pays the same ${h.m(8000)} and gets the same ${h.m(scot.providerTopUp)} from the provider, but the claim is worked out on Scottish bands: on ${h.m(60000)} it is ${h.m(scot.claim)}, because part of the income is taxed at 21% and part at 42%. Someone paying ${h.m(4000)} with only ${h.m(2000)} of earnings is over the limit: relief is due on ${h.m(low.relievable)} gross only, and the provider must hand back the top-up on the ${h.m(low.overLimit)} above it. The calculator flags that case.</p>
<h2>What the calculator leaves to you</h2>
<p>It does not know your other pensions. Enter workplace contributions and employer money in the fields provided, since they share the annual allowance with the SIPP. It ignores provider charges and investment returns, which do not change the tax. If your total savings for the year go above ${h.m(h.P.allowances.years['2026/27'].aa)}, the ${h.a('carry-forward-calculator', 'carry forward calculator')} shows how much unused allowance from the last three years you can use first. To see how relief at source compares with net pay or salary sacrifice for the same amount, use the ${h.a('home', 'pension tax relief calculator')}; the ${h.a('higher-rate-pension-tax-relief', 'higher rate relief guide')} explains how the claim is made.</p>
<p>When a SIPP is opened by transfer from an old workplace pension, the transfer itself gets no relief and does not count towards the annual allowance; only new money does. The calculator therefore asks for the payment you make this tax year from your own account.</p>
<h2>Paying for a partner or a child</h2>
<p>Anyone can pay into someone else's SIPP, and the relief belongs to the member, not the payer. A parent paying ${h.m(h.P.relief.basicAmountNet)} into a child's pension sees ${h.m(h.P.relief.basicAmount)} invested. A partner with no earnings gets the same. The higher rate relief of the payer is not available, because the contribution is the member's.</p>`;
  },
});
