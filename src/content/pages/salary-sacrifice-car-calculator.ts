import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'salary-sacrifice-car-calculator',
  group: 'cars',
  order: 20,
  tool: { kind: 'tool:car', props: { salary: 55000, monthly: 450, price: 42000, kind: 0, year: 0 } },
  related: ['ev-salary-sacrifice-bik-rates', 'salary-sacrifice-calculator', 'salary-sacrifice-child-benefit', 'pension-tax-relief-on-60000-salary'],
  sources: ['hmrc_480', 'leg_itepa139', 'hmrc_ss', 'hmrc_employer'],
  slug: 'salary-sacrifice-car-calculator',
  nav: 'Salary sacrifice car calculator',
  card: 'Real monthly cost of an electric or plug-in hybrid car through salary sacrifice, after Income Tax, NI and company car tax.',
  title: 'Salary Sacrifice Car Calculator: Real Cost of an EV 2026/27',
  description: 'Salary sacrifice car calculator: the real monthly cost of an electric or hybrid car after tax and NI saved and company car tax of 4 to 9%, 2026/27 to 2029/30.',
  h1: 'Salary sacrifice car calculator: what an electric car really costs you a month',
  intro: 'Enter your salary, the monthly amount in the salary sacrifice quote and the car’s list price. You get the net monthly cost after the tax and NI you save and the benefit in kind tax you pay.',
  resume: (h) => {
    const c = h.C.sacrificeCar({ salary: 55000, monthly: 450, listPrice: 42000, year: '2026/27', kind: 'zero' });
    return `A car scheme takes a fixed monthly amount out of your gross salary, so you save Income Tax and National Insurance on it, and in return you pay company car tax on the benefit in kind. For an electric car the taxable benefit is the list price times an appropriate percentage set in ${h.src('leg_itepa139', 'section 139 of the Income Tax (Earnings and Pensions) Act 2003')}: ${h.pc(h.P.cars.zero['2026/27'])} in ${h.P.taxYear}, ${h.pc(h.P.cars.zero['2027/28'])} in 2027/28, ${h.pc(h.P.cars.zero['2028/29'])} in 2028/29 and ${h.pc(h.P.cars.zero['2029/30'])} in 2029/30. Cars emitting up to ${h.P.sacrifice.carMaxCo2NormalRules} g/km keep these normal rules under salary sacrifice (${h.src('hmrc_ss', 'HMRC')}); others are taxed on the salary given up if that is higher. On ${h.m(55000)}, giving up ${h.m(450)} a month for a ${h.m(42000)} electric car saves ${h.m(c.taxSaved / 12)} of tax and ${h.m(c.niSaved / 12)} of NI a month and adds ${h.m(c.bikTax / 12)} of car tax, for a real cost of ${h.m(c.netMonthly)} a month instead of ${h.m(450)}.`;
  },
  faqs: (h) => [
    { q: 'Is the April 2029 salary sacrifice cap about cars as well?', a: `No. The ${h.m(h.P.sacrifice.niCap)} cap published by HM Treasury and HMRC covers employee pension contributions made by salary sacrifice. A car scheme is a different benefit and keeps the normal rules for cars up to ${h.P.sacrifice.carMaxCo2NormalRules} g/km. What does change each year is the appropriate percentage, which rises to ${h.pc(h.P.cars.zero['2029/30'])} for electric cars in 2029/30 under the Finance Act 2025.` },
    { q: 'What list price is used for company car tax?', a: 'The price of the car new, including VAT, delivery and any options fitted when it was supplied, less any capital contribution you make up to £5,000. It is not the price your employer or the leasing company pays after discounts. The scheme quote or the P11D form gives the figure, and a used car keeps the list price it had when new.' },
    { q: 'Does salary sacrifice for a car affect my pension?', a: 'It can. If your pension contributions are a percentage of salary, a lower contractual salary may mean less going into the pension unless the employer uses your salary before the car deduction. Death in service cover and life assurance can also follow the lower figure. Ask the employer which salary it uses before you sign.' },
    { q: 'Why is a plug-in hybrid taxed so much more from 2028/29?', a: `Until 2027/28 a hybrid between 1 and 50 g/km is taxed according to its electric range, so a long-range model pays almost the electric rate. From 2028/29 the Finance Act 2025 replaces the range bands with a single rate of ${h.pc(h.P.cars.hybrid['2028/29'][0].rate)}, rising to ${h.pc(h.P.cars.hybrid['2029/30'][0].rate)} the year after, so the range no longer helps.` },
  ],
  body: (h) => {
    const yrs = h.C.CAR_YEARS;
    const sal = [35000, 55000, 80000, 130000];
    const rows = sal.map((s) => [h.m(s), ...yrs.map((y) => h.m(h.C.sacrificeCar({ salary: s, monthly: 450, listPrice: 42000, year: y, kind: 'zero' }).netMonthly))]);
    const hy = h.C.sacrificeCar({ salary: 55000, monthly: 450, listPrice: 42000, year: '2026/27', kind: 'hybrid', range: 40 });
    const hy2 = h.C.sacrificeCar({ salary: 55000, monthly: 450, listPrice: 42000, year: '2028/29', kind: 'hybrid', range: 40 });
    const er = h.C.sacrificeCar({ salary: 55000, monthly: 450, listPrice: 42000, year: '2026/27', kind: 'zero' });
    return `<h2>Monthly cost of a salary sacrifice car, by salary and tax year</h2>
<p>The table keeps the same car and the same ${h.m(450)} a month, and changes salary and year. A basic rate taxpayer saves 20% tax and 8% NI; above ${h.m(h.higherStart)} the saving is 40% and 2%, and between ${h.m(100000)} and ${h.m(h.I.paZeroAt)} the Personal Allowance taper adds to it. The rise in the appropriate percentage adds a few pounds a month each year.</p>
${h.table(['Salary', ...yrs.map((y) => `Real cost ${y}`)], rows, `${h.m(42000)} electric car, ${h.m(450)} a month sacrificed, England, Wales or Northern Ireland. ${h.P.taxYear} tax bands kept for later years; percentages from ITEPA 2003 s.139 as amended.`, ['l', 'r', 'r', 'r', 'r'])}
<h2>Electric against plug-in hybrid</h2>
<p>A plug-in hybrid with 40 miles of electric range is taxed at ${h.pc(hy.rate)} in ${h.P.taxYear}, against ${h.pc(er.rate)} for an electric car. On the same ${h.m(42000)} list price the hybrid costs ${h.m(hy.netMonthly)} a month instead of ${h.m(er.netMonthly)}, and ${h.m(hy2.netMonthly)} in 2028/29 when the rate becomes ${h.pc(hy2.rate)}. HMRC's ${h.src('hmrc_480', 'guide 480, appendix 2')} sets out the bands by range.</p>
<h2>What the employer pays and saves</h2>
<p>Your employer saves its own 15% NI on the salary you give up (${h.src('hmrc_employer', 'HMRC rates for employers')}) and pays Class 1A NI at 15% on the benefit in kind: on this car ${h.m(er.employerNiSaved)} saved against ${h.m(er.employerClass1A)} paid a year. That gap is why many employers offer the scheme. The calculator leaves out insurance, maintenance and home charging, which schemes often include, and early termination charges, which can be large if you leave the job. For the rates of each year and what they mean for a three or four year lease, see the ${h.a('ev-salary-sacrifice-bik-rates', 'guide to electric car benefit in kind rates')}. A pension sacrifice can be run on the ${h.a('salary-sacrifice-calculator', 'salary sacrifice pension calculator')}.</p>
<h2>Before you sign a lease</h2>
<p>Salary sacrifice car schemes usually run for two to four years, so the rate that matters is the average over the lease, not this year's. A car taken on in ${h.P.taxYear} for four years will be taxed at ${h.pc(h.P.cars.zero['2026/27'])}, ${h.pc(h.P.cars.zero['2027/28'])}, ${h.pc(h.P.cars.zero['2028/29'])} and ${h.pc(h.P.cars.zero['2029/30'])} in turn, and the calculator's year field shows each one. Check what happens if you leave the employer, go on parental leave or your pay falls close to the National Minimum Wage, since the sacrifice cannot take cash pay below it. Ask whether the employer passes on any of its NI saving, and whether your pension contributions are worked out on the salary before or after the car.</p>`;
  },
});
