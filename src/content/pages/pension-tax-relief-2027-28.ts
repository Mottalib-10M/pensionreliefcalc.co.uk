import { definePage } from '../../lib/guide-types';

// Campagne 2027 (2026-11-23): Budget 2026 figures for 2027/28 (OOTLAR Annex A, updated 5 November 2026).
// Every rate and allowance used by the relief engine is unchanged in 2027/28 for England, Wales and Northern
// Ireland (tested in tests/engine.test.ts), so the calculator runs on the same figures; Scotland is not set yet.
const SAL = 60000, PAID = 4000;

export default definePage({
  id: 'pension-tax-relief-2027-28',
  group: 'relief',
  order: 15,
  tool: { kind: 'tool:relief', props: { salary: SAL, amount: PAID, method: 0 } },
  related: ['higher-rate-pension-tax-relief', 'annual-allowance-calculator', 'salary-sacrifice-2029-cap', 'scottish-pension-tax-relief'],
  sources: ['gov_ootlar_2027', 'gov_benefits_2027', 'gov_freeze_2031', 'gov_rates', 'gov_scot'],
  slug: 'pension-tax-relief-2027-28',
  nav: 'Pension tax relief 2027/28',
  card: 'The Budget 2026 figures for April 2027: frozen bands, the same allowances, a higher State Pension, and the relief a contribution gets.',
  title: 'Pension Tax Relief 2027/28: Rates, Allowances, Calculator',
  description: 'Pension tax relief 2027/28: Budget 2026 keeps the 20%, 40% and 45% bands, the £60,000 annual allowance and £10,000 MPAA. The relief a contribution gets in 2027.',
  h1: 'Pension tax relief in 2027/28: what Budget 2026 set for April 2027',
  intro: 'Enter a salary and a pension contribution: the calculator gives the relief and the cost to take-home pay. Budget 2026 left every relief figure unchanged for 2027/28 in England, Wales and Northern Ireland, so the result holds for both tax years.',
  resume: (h) => {
    const Y = h.P.y2027, r = h.relief({ salary: SAL, method: 'ras', amount: PAID });
    return `Budget 2026 set the tax figures for ${Y.taxYear}, and for pension tax relief nothing moves. The Overview of Tax Legislation and Rates keeps the personal allowance at ${h.m(Y.personalAllowance)}, the basic rate band at ${h.m(Y.basicBand)} and the additional rate threshold at ${h.m(Y.additionalFrom)}, with rates of ${h.pc(Y.rates.basic, 0)}, ${h.pc(Y.rates.higher, 0)} and ${h.pc(Y.rates.additional, 0)} on earnings. The annual allowance stays at ${h.m(Y.aa)}, the money purchase annual allowance at ${h.m(Y.mpaa)} and the taper still starts at ${h.m(Y.taperAdjusted)} of adjusted income. Relief therefore works exactly as in ${h.P.taxYear}: someone on ${h.m(SAL)} who pays ${h.m(PAID)} into a relief at source pension gets ${h.m(r.gross)} in the pot and ${h.m(r.claim)} to claim back through Self Assessment, a net cost of ${h.m(r.netCost)}. What does change in April 2027 is around relief, not in it: savings and property income get their own higher rates, and the State Pension rises to ${h.m2(Y.statePensionWeekly)} a week.`;
  },
  faqs: (h) => {
    const Y = h.P.y2027;
    return [
      { q: 'Is pension tax relief changing in April 2027?', a: `Not for contributions. Budget 2026 keeps the bands, the rates on earnings and the pension allowances for ${Y.taxYear}: relief is still given at your marginal rate, up to ${h.m(Y.aa)} a year or your earnings if lower. The announced change is later: from April 2029, salary sacrifice above ${h.m(h.P.sacrifice.niCap)} a year loses its National Insurance saving.` },
      { q: 'What is the annual allowance for 2027/28?', a: `${h.m(Y.aa)}, the same as in ${h.P.taxYear}, with the money purchase annual allowance at ${h.m(Y.mpaa)} for people who have flexibly drawn from a pension. The tapered annual allowance still applies above ${h.m(Y.taperAdjusted)} of adjusted income, and unused allowance from the three previous tax years can still be carried forward.` },
      { q: 'Are the Scottish tax bands for 2027/28 known?', a: `Not yet. The Scottish Government sets its bands and rates in its own budget, usually in December or January, and the Scottish Parliament votes them before April. Until then the calculator uses the ${h.P.taxYear} Scottish bands for a Scottish taxpayer. Relief at source still adds 20% automatically, and the extra relief above it is claimed as before.` },
    ];
  },
  body: (h) => {
    const Y = h.P.y2027, I = h.P.income, A = h.P.allowances.years[h.P.allowances.current as keyof typeof h.P.allowances.years];
    const wk = (x: number) => `${h.m(x)} a week`;
    const rows: Array<[string, string, string]> = [
      ['Personal allowance', h.m(I.personalAllowance), h.m(Y.personalAllowance)],
      ['Allowance withdrawn from', h.m(I.taperThreshold), h.m(Y.taperThreshold)],
      ['Basic rate band (20%)', h.m(I.ruk[0].upTo!), h.m(Y.basicBand)],
      ['Additional rate (45%) from', h.m(I.paZeroAt), h.m(Y.additionalFrom)],
      ['Annual allowance', h.m(A.aa), h.m(Y.aa)],
      ['Money purchase annual allowance', h.m(A.mpaa ?? 0), h.m(Y.mpaa)],
      ['Taper: adjusted income above', h.m(A.adjusted), h.m(Y.taperAdjusted)],
      ['Employee NI: primary threshold', h.m(h.P.ni.primaryThreshold), wk(Y.niWeekly.pt)],
      ['Employee NI: upper earnings limit', h.m(h.P.ni.upperEarningsLimit), wk(Y.niWeekly.uel)],
      ['Full new State Pension', h.m2(h.P.statePension.fullWeekly) + ' a week', h.m2(Y.statePensionWeekly) + ' a week'],
      ['Child Benefit, eldest child', h.m2(h.P.childBenefit.eldestWeekly) + ' a week', h.m2(Y.childBenefit.eldestWeekly) + ' a week'],
    ];
    const grid = [40000, 60000, 80000, 110000, 150000].map((s) => { const r = h.relief({ salary: s, method: 'ras', amount: PAID }); return [h.m(s), h.m(r.gross), h.m(r.claim), h.m(r.netCost), h.pc(r.effectiveRate)]; });
    return `<h2>Pension tax relief figures, ${h.P.taxYear} and ${Y.taxYear}</h2>
<p>The ${Y.taxYear} column comes from the ${h.src('gov_ootlar_2027', 'Budget 2026 rates and allowances annex')}, which HMRC updated on 5 November 2026, and from the ${h.src('gov_benefits_2027', 'proposed benefit and pension rates')} for the State Pension and Child Benefit. The ${h.P.taxYear} column is the one the whole site uses (${h.src('gov_rates', 'GOV.UK, Income Tax rates')}). National Insurance thresholds are set per week in the annex; ${wk(Y.niWeekly.pt)} matches the yearly ${h.m(h.P.ni.primaryThreshold)} and ${wk(Y.niWeekly.uel)} the ${h.m(h.P.ni.upperEarningsLimit)} limit.</p>
${h.table(['Figure', h.P.taxYear, Y.taxYear], rows, 'England, Wales and Northern Ireland for Income Tax; National Insurance and benefits UK-wide.', ['l', 'r', 'r'])}
<p>The freeze of the personal allowance and the bands runs to April 2031 (${h.src('gov_freeze_2031', 'HMRC policy paper')}), so a pay rise keeps pulling more income into the higher rate. That is the one way the 2027/28 figures change relief in practice: a salary that crosses the higher rate line in 2027 gets 40% relief on the part above it, where it got 20% before.</p>
<h2>What a ${h.m(PAID)} contribution gets in ${Y.taxYear}</h2>
<p>Because the bands and rates on earnings are the same, the relief on a given salary is the same in both years. The table below runs the site's calculator, by relief at source, for a contribution of ${h.m(PAID)} a year paid from the bank.</p>
${h.table(['Salary', 'In the pension', 'To claim back', 'Net cost', 'Relief'], grid, `Relief at source, ${h.m(PAID)} paid, England, Wales and Northern Ireland, ${Y.taxYear} (same as ${h.P.taxYear}).`, ['r', 'r', 'r', 'r', 'r'])}
<p>The rate jumps where income crosses the higher rate line and again between ${h.m(Y.taperThreshold)} and ${h.m(Y.additionalFrom)}, where the personal allowance is withdrawn and each pound of contribution saves up to 60%. The ${h.a('higher-rate-pension-tax-relief', 'higher rate page')} and the ${h.a('pension-contributions-over-100k', 'over £100,000 page')} go through those cases.</p>
<h2>Around relief: what does change in April 2027</h2>
<p>From 6 April 2027, savings income is taxed at ${h.pc(Y.savingsRates.basic, 0)}, ${h.pc(Y.savingsRates.higher, 0)} and ${h.pc(Y.savingsRates.additional, 0)}, and property income gets the same separate rates. Neither affects relief on pension contributions, which is given against earnings, but both make the pension more attractive against a savings account or a buy-to-let for the same money. Pension income itself is still taxed at the main rates.</p>
<p>The full new State Pension rises to ${h.m2(Y.statePensionWeekly)} a week, about ${h.m(Y.statePensionWeekly * 52)} a year, above the frozen personal allowance of ${h.m(Y.personalAllowance)}. The annex lists for ${Y.taxYear} a new Pensions Tax Allowance, given in full when income is ${h.m(Y.pensionsTaxAllowance.fullBelow)} or less and withdrawn by ${h.m(1)} for every ${h.m(Y.pensionsTaxAllowance.withdrawPer)} above, so that it is gone at ${h.m(Y.pensionsTaxAllowance.goneAt)}. The ${h.a('pension-calculator', 'pension calculator')} shows what a private pot adds on top of the State Pension. Scotland sets its own bands in its budget, not yet published for ${Y.taxYear}: the ${h.a('scottish-pension-tax-relief', 'Scottish page')} stays on ${h.P.taxYear} and the ${h.src('gov_scot', 'Scottish rates')} will be added when voted. These are general rules; your own tax code and contracts decide the result, and this page is not financial advice.</p>`;
  },
});
