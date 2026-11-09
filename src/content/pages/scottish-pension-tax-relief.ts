import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'scottish-pension-tax-relief',
  group: 'relief',
  order: 30,
  mini: { kind: 'mini:scot', props: { salary: 45000, paid: 2400 } },
  related: ['higher-rate-pension-tax-relief', 'relief-at-source-vs-net-pay', 'pension-tax-relief-on-50000-salary', 'home'],
  sources: ['gov_scot', 'gov_relief', 'hmrc_employer', 'hmrc_claim'],
  slug: 'scottish-pension-tax-relief',
  nav: 'Pension tax relief in Scotland',
  card: 'The six Scottish rates and the extra 1, 22, 25 or 28% to claim, with the salaries where Scotland and England differ most.',
  title: 'Pension Tax Relief in Scotland 2026/27: Rates and Claims',
  description: 'Pension tax relief in Scotland for 2026/27: the six Scottish rates, the extra 1, 22, 25 or 28% to claim on relief at source, and net pay and sacrifice',
  h1: 'Pension tax relief in Scotland: the six rates and what to claim',
  intro: 'Scottish taxpayers pay Income Tax on wages and pensions at Scottish rates, so their pension relief follows those rates too. Here is how the relief works in each band, and where it beats the rest of the UK.',
  resume: (h) => {
    const s = h.relief({ salary: 45000, nation: 'scotland', method: 'ras', amount: 2400 });
    const u = h.relief({ salary: 45000, method: 'ras', amount: 2400 });
    return `If you live in Scotland, your earnings are taxed at six Scottish rates in ${h.P.taxYear}: 19% starter, 20% basic, 21% intermediate, 42% higher, 45% advanced and 48% top (${h.src('gov_scot', 'GOV.UK, Income Tax in Scotland')}). Pension relief follows the same rates. In a net pay scheme or through salary sacrifice it comes automatically through payroll. In a relief at source scheme, including every SIPP, the provider adds 20% whatever your rate, and you claim the difference from HMRC: 1% for intermediate rate taxpayers, 22% for higher rate, 25% for advanced rate and 28% for top rate taxpayers (${h.src('gov_relief', 'GOV.UK, pension tax relief')}). Starter rate taxpayers keep the full 20% even though they pay 19%. Because the Scottish higher rate starts at ${h.m(h.scotHigher)}, a lot of people on ordinary salaries are due more relief than in England. On ${h.m(45000)}, ${h.m(2400)} paid into a SIPP gives ${h.m(s.claim)} to claim in Scotland and ${h.m(u.claim)} in England, Wales or Northern Ireland.`;
  },
  faqs: (h) => [
    { q: 'Do I need to claim the 1% intermediate rate relief?', a: 'Yes, if your pension uses relief at source; HMRC does not give it automatically to everyone. Many intermediate rate taxpayers receive it through their tax code once HMRC has the details. For a contribution of a few hundred pounds the amount is small, but for several thousand it adds up, and it can be claimed back four years.' },
    { q: 'Am I a Scottish taxpayer if I work in England?', a: 'Scottish taxpayer status depends on where you live, not where you work. If your main home is in Scotland you pay Scottish rates on earnings, even if your employer is in London. Your tax code starts with S. If you have homes in both, HMRC looks at where you spend more time and where your main home is.' },
    { q: 'Does National Insurance differ in Scotland?', a: `No. NI is set for the whole UK: 8% for employees between ${h.m(h.P.ni.primaryThreshold)} and ${h.m(h.P.ni.upperEarningsLimit)}, 2% above. That matters because the Scottish higher rate starts below the NI upper limit, so between ${h.m(h.scotHigher)} and ${h.m(h.P.ni.upperEarningsLimit)} a Scottish employee pays 42% tax plus 8% NI, and salary sacrifice saves 50% on that slice.` },
    { q: 'Are savings and dividends taxed at Scottish rates?', a: 'No. Interest and dividends are taxed at UK rates for everyone, including Scottish taxpayers. Only earnings, pensions, rental profits and other non-savings income use the Scottish bands. Pension relief at Scottish rates applies because contributions are set against that non-savings income.' },
  ],
  body: (h) => {
    const sal = [15000, 25000, 40000, 48000, 70000, 90000, 140000];
    const rows = sal.map((s) => { const a = h.relief({ salary: s, nation: 'scotland', method: 'ras', amount: 1600 }), b = h.relief({ salary: s, method: 'ras', amount: 1600 }); return [h.m(s), h.T.BAND_LABEL[a.topBandBefore], h.m(a.claim), h.m(b.claim), h.m(a.netCost), h.m(b.netCost)]; });
    const bands = h.I.scotlandIncomeBands.map((b) => [b.name, b.to === null ? `over ${h.m(b.from - 1)}` : `${h.m(b.from)} to ${h.m(b.to)}`, h.pc(b.rate)]);
    const ss = h.R.compareMethods(48000, 2000, 'scotland');
    return `<h2>Scottish bands for ${h.P.taxYear}</h2>
${h.table(['Band', 'Income (with the full Personal Allowance)', 'Rate'], bands, `GOV.UK, Income Tax in Scotland, read on ${h.date(h.P.retrieved_at)}. The Personal Allowance is reduced above ${h.m(100000)} as elsewhere in the UK.`, ['l', 'l', 'r'])}
<h2>Relief at source in Scotland and in the rest of the UK</h2>
${h.table(['Income', 'Scottish band', 'Claim, Scotland', 'Claim, rest of UK', 'Cost, Scotland', 'Cost, rest of UK'], rows, `${h.m(1600)} paid from your bank, ${h.m(2000)} gross. Engine of this site.`, ['l', 'l', 'r', 'r', 'r', 'r'])}
<p>The biggest gap is between ${h.m(h.scotHigher)} and ${h.m(h.higherStart)}: a Scottish taxpayer is in the 42% band and can claim 22% extra, while a taxpayer elsewhere is still at the basic rate and has nothing to claim. Above ${h.m(75000)}, the advanced rate of 45% gives 25% extra, against 20% in England. Below ${h.m(29527)} there is almost no difference.</p>
<h2>How the band extension works across six bands</h2>
<p>For relief at source, HMRC extends the Scottish bands by the gross contribution in the same way as the UK basic rate band, except the starter band. In practice that moves income from the top band you reach down into the band below, then the next, and so on. A gross contribution that matches income in the 42% band earns 22% extra; any part that reaches down into the 21% band earns 1%. The calculator does the arithmetic band by band, and tests it against GOV.UK's figures of 1%, 22%, 25% and 28%.</p>
<h2>Net pay and salary sacrifice in Scotland</h2>
<p>Net pay and sacrifice give relief at your Scottish rate through payroll, with nothing to claim. On ${h.m(48000)}, ${h.m(2000)} into a pension costs ${h.m(ss.ras.netCost)} by relief at source once the claim is made, ${h.m(ss.netpay.netCost)} by net pay and ${h.m(ss.sacrifice.netCost)} by sacrifice. The sacrifice figure is low because the slice between ${h.m(h.scotHigher)} and ${h.m(h.P.ni.upperEarningsLimit)} carries 42% tax and 8% NI (${h.src('hmrc_employer', 'HMRC, rates for employers')}), a combination that does not exist elsewhere in the UK. From 6 April 2029, only the first ${h.m(h.P.sacrifice.niCap)} a year of sacrifice keeps the NI saving.</p>
<h2>Making the claim</h2>
<p>Claims work as in the rest of the UK: through Self Assessment if you file a return, or through ${h.src('hmrc_claim', 'HMRC’s online claim')} if you do not. Give the gross amount. HMRC knows you are a Scottish taxpayer from your address and works out the claim at Scottish rates. Because the intermediate rate relief is small, some people never claim it; at 1% of a ${h.m(5000)} gross contribution it is ${h.m(50)} a year, still worth a short online form.</p>
<h2>Moving between Scotland and England</h2>
<p>Your status is set for the whole tax year by where your main home was for most of it. If you move from Edinburgh to Manchester in October, you are probably a Scottish taxpayer for that year; from the next 6 April you pay UK rates and your claim changes with them. The ${h.a('home', 'calculator on the home page')} has a Scotland setting, as do the ${h.a('higher-rate-pension-tax-relief', 'higher rate guide')} and the ${h.a('pension-tax-relief-on-50000-salary', '£50,000 page')}, where the difference between the two systems is at its widest. For how the methods differ in principle, see the ${h.a('relief-at-source-vs-net-pay', 'guide to the three methods')}.</p>
<h2>Five Scottish taxpayers</h2>
<p>A care worker on ${h.m(15000)} is in the starter band. Her relief at source pension adds 20% to what she pays even though her top rate is 19%, and HMRC does not take the difference back. A bus driver on ${h.m(28000)} is in the basic band: 20% relief, nothing to claim. A teacher on ${h.m(40000)} is an intermediate rate taxpayer at 21%; in a relief at source scheme she can claim 1% of her gross contributions, while in a scheme that takes contributions from pay before tax she would get 21% automatically. An engineer on ${h.m(55000)} pays 42% on income above ${h.m(43662)}: a ${h.m(2000)} gross contribution earns 22% extra, ${h.m(440)}, if it all matches income in that band. A consultant on ${h.m(90000)} pays the 45% advanced rate above ${h.m(75000)} and can claim 25% extra on contributions matching that slice.</p>
<h2>Why the 1% claim exists</h2>
<p>The intermediate rate of 21% sits one point above the UK basic rate that relief at source providers claim from HMRC. Without a claim, an intermediate rate taxpayer in a relief at source scheme would get one point less relief than a colleague in a net pay scheme. HMRC gives the extra 1% through Self Assessment, a claim or your tax code. Check your tax calculation: if it already shows relief at 21%, nothing more is due.</p>
<h2>The NI slice between ${h.m(h.scotHigher)} and ${h.m(h.P.ni.upperEarningsLimit)}</h2>
<p>Scottish employees between those two figures pay 42% Income Tax and 8% employee NI on each extra pound, a combined 50%, which is higher than the 42% combined rate that applies above ${h.m(h.P.ni.upperEarningsLimit)}. Salary sacrifice relieves both, so a sacrifice that brings pay down to ${h.m(43662)} saves half of every pound given up. Until April 2029 that makes Scottish sacrifice in that slice one of the most valuable pension contributions in the UK; after the cap, the NI part is limited to the first ${h.m(h.P.sacrifice.niCap)} a year.</p>
<h2>The self-employed in Scotland</h2>
<p>Self-employed people pay Scottish Income Tax on their profits and UK Class 4 NI, and make pension contributions by relief at source, usually through a SIPP. Pension contributions do not reduce Class 4 NI. The extra Scottish relief comes through the Self Assessment return, where the gross contribution extends the bands automatically. Because profits vary, many self-employed savers make one contribution near the end of the tax year, once they know their figures.</p>
<h2>Scottish rates in later years</h2>
<p>The Scottish rates and bands are set each year by the Scottish Parliament, usually in a budget early in the calendar year, for the tax year starting in April. The figures here are those GOV.UK gives for ${h.P.taxYear}. The relief rules themselves, band extension and the 20% added by the provider, are UK law and do not change with the Scottish budget. When new Scottish rates are published, the extra relief to claim changes with them: a rise in the higher rate would raise the 22% extra, for example. The calculator will be updated once rates for 2027/28 are on GOV.UK; until then it uses ${h.P.taxYear} for every calculation.</p>
<h2>A Scottish couple</h2>
<p>A couple in Glasgow earn ${h.m(48000)} and ${h.m(26000)}. Each pays ${h.m(2000)} gross into a SIPP. The first, a higher rate taxpayer, can claim 22% extra on contributions matching income above ${h.m(43662)}; the second, in the basic band, has nothing to claim. If the household can only afford one contribution, paying it into the higher earner's pension earns more relief. In England the same couple would get 20% on both, because neither reaches ${h.m(h.higherStart)}.</p>
<p>The mini-calculator at the top of this page compares one contribution in Scotland and in the rest of the UK; enter your own salary to see the gap.</p>`;
  },
});
