import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'ev-salary-sacrifice-bik-rates',
  group: 'cars',
  order: 50,
  mini: { kind: 'mini:bik-years', props: { price: 45000, salary: 55000 } },
  related: ['salary-sacrifice-car-calculator', 'salary-sacrifice-calculator', 'salary-sacrifice-2029-cap', 'pension-tax-relief-on-80000-salary'],
  sources: ['leg_itepa139', 'leg_fa23_11', 'leg_fa25_5', 'leg_fa25_6', 'hmrc_480', 'gov_budget26'],
  slug: 'ev-salary-sacrifice-bik-rates',
  nav: 'Electric company car tax (BIK) to 2030',
  card: 'Benefit in kind rates for electric cars and plug-in hybrids from 2026/27 to 2029/30, and what they mean over a salary sacrifice lease.',
  title: 'Electric Car BIK Rates 2026 to 2030 for Salary Sacrifice',
  description: 'Electric car BIK rates for salary sacrifice: 4% in 2026/27 rising to 9% in 2029/30 by law, plug-in hybrid bands by range, and the yearly tax on a lease.',
  h1: 'Electric car BIK rates from 2026/27 to 2029/30, and what they cost through salary sacrifice',
  intro: 'Company car tax on an electric car depends on one figure: the appropriate percentage of the list price. It is set in law for each year to 2029/30. Here are the rates and what they mean for a car taken through salary sacrifice.',
  resume: (h) => {
    const z = h.P.cars.zero;
    const c = h.C.sacrificeCar({ salary: 55000, monthly: 0, listPrice: 45000, year: '2026/27', kind: 'zero' });
    const d = h.C.sacrificeCar({ salary: 55000, monthly: 0, listPrice: 45000, year: '2029/30', kind: 'zero' });
    return `The taxable benefit of a company car is its list price multiplied by an appropriate percentage set in ${h.src('leg_itepa139', 'section 139 of the Income Tax (Earnings and Pensions) Act 2003')}. For a car with zero emissions it is ${h.pc(z['2026/27'])} in ${h.P.taxYear} and ${h.pc(z['2027/28'])} in 2027/28 under the ${h.src('leg_fa23_11', 'Finance Act 2023')}, then ${h.pc(z['2028/29'])} in 2028/29 and ${h.pc(z['2029/30'])} in 2029/30 under the ${h.src('leg_fa25_5', 'Finance Act 2025')}. Plug-in hybrids from 1 to 50 g/km are taxed by electric range until 2027/28, from ${h.pc(h.P.cars.hybrid['2026/27'][0].rate)} to ${h.pc(h.P.cars.hybrid['2026/27'][4].rate)}, and at a single ${h.pc(h.P.cars.hybrid['2028/29'][0].rate)} in 2028/29 and ${h.pc(h.P.cars.hybrid['2029/30'][0].rate)} in 2029/30. Through salary sacrifice, cars up to ${h.P.sacrifice.carMaxCo2NormalRules} g/km keep these rules. A higher rate taxpayer with a ${h.m(45000)} electric car pays ${h.m(c.bikTax)} of company car tax this year and ${h.m(d.bikTax)} in 2029/30. Budget 2026 announced ${h.pc(h.P.cars.announced2030.zero)} for 2030/31, not yet law.`;
  },
  faqs: (h) => [
    { q: 'What is the BIK rate for an electric car in 2026/27?', a: `${h.pc(h.P.cars.zero['2026/27'])} of the list price. On a ${h.m(40000)} car the taxable benefit is ${h.m(1600)}, which costs a basic rate taxpayer ${h.m(320)} and a higher rate taxpayer ${h.m(640)} a year. The rate rises by one point to ${h.pc(h.P.cars.zero['2027/28'])} on 6 April 2027 and by two points a year after that.` },
    { q: 'Will electric car BIK rates keep rising after 2030?', a: `The Budget of 28 October 2026 announced rates for 2030/31 one point above 2029/30: ${h.pc(h.P.cars.announced2030.zero)} for zero emission cars, ${h.pc(h.P.cars.announced2030.hybrid)} for cars of 1 to 50 g/km and a maximum of ${h.pc(h.P.cars.announced2030.max)}. These still need to be legislated. No rate after 2030/31 has been set.` },
    { q: 'How is a plug-in hybrid’s electric range used?', a: 'The official electric range on the certificate of conformity, rounded up to a whole mile, decides the band for cars of 1 to 50 g/km up to 2027/28: 130 miles or more, 70 to 129, 40 to 69, 30 to 39 or under 30. The longer the range, the lower the rate. From 2028/29 the range no longer matters.' },
    { q: 'Do I pay BIK on an electric car if my employer pays for charging at work?', a: 'No. Electricity supplied by the employer to charge a company car is not treated as fuel, so there is no fuel benefit charge for electric cars. Charging at work for an employee’s own car is exempt as well. Home charging paid by you can be reimbursed under HMRC’s advisory electric rate for business miles.' },
  ],
  body: (h) => {
    const yrs = h.C.CAR_YEARS;
    const bands = [['130 miles or more', 130], ['70 to 129 miles', 70], ['40 to 69 miles', 40], ['30 to 39 miles', 30], ['under 30 miles', 0]] as const;
    const rows = [['Zero emission', ...yrs.map((y) => h.pc(h.P.cars.zero[y]))], ...bands.map(([lab, r]) => [`1 to 50 g/km, ${lab}`, ...yrs.map((y) => h.pc(h.C.appropriatePercentage(y, 'hybrid', r)))]), ['Maximum (most polluting)', ...yrs.map((y) => h.pc((h.P.cars.maxRate as Record<string, number>)[y]))]];
    const lease = (kind: 'zero' | 'hybrid', range = 0) => yrs.reduce((s, y) => s + h.C.sacrificeCar({ salary: 55000, monthly: 450, listPrice: 42000, year: y, kind, range }).netMonthly * 12, 0);
    const ev = lease('zero'), ph = lease('hybrid', 45);
    const basic = h.C.sacrificeCar({ salary: 35000, monthly: 450, listPrice: 42000, year: '2026/27', kind: 'zero' });
    const add = h.C.sacrificeCar({ salary: 160000, monthly: 450, listPrice: 42000, year: '2026/27', kind: 'zero' });
    return `<h2>Electric car BIK rates by year</h2>
${h.table(['Car', ...yrs], rows, `ITEPA 2003 s.139 as amended by the Finance Act 2023 s.11 and the Finance Act 2025 ss.5 and 6; HMRC, ${'guide 480'}, appendix 2. Read on ${h.date(h.P.retrieved_at)}.`, ['l', 'r', 'r', 'r', 'r'])}
<p>The rates for 2028/29 and 2029/30 were set two years ahead by the ${h.src('leg_fa25_6', 'Finance Act 2025')} so that leasing companies and employees could plan. The ${h.src('hmrc_480', 'HMRC guide 480')} shows how the percentage is chosen for each car, including the rounding of range.</p>
<h2>A four-year lease from 2026/27</h2>
<p>An employee on ${h.m(55000)} gives up ${h.m(450)} a month for a ${h.m(42000)} car from April 2026 to March 2030. With an electric car the real cost over the four years, after tax and NI saved and company car tax paid, comes to about ${h.m(ev)}, against ${h.m(450 * 48)} of salary given up. A plug-in hybrid with 45 miles of range costs about ${h.m(ph)} over the same period, because its rate jumps when the range bands end in 2028/29. These figures keep ${h.P.taxYear} tax bands for every year, since later bands are not set.</p>
<h2>Why the saving depends on your tax band</h2>
<p>The salary given up saves tax and NI at your marginal rates, while the benefit is taxed at your Income Tax rate only. For a basic rate taxpayer on ${h.m(35000)}, the same car and payment cost ${h.m(basic.netMonthly)} a month in ${h.P.taxYear}, a saving of ${h.pc(basic.savingShare)}. For an additional rate taxpayer on ${h.m(160000)}, it is ${h.m(add.netMonthly)} a month, a saving of ${h.pc(add.savingShare)}. Between ${h.m(100000)} and ${h.m(h.I.paZeroAt)} the saving is largest, because the salary given up also wins back Personal Allowance.</p>
<h2>Salary sacrifice rules for cars</h2>
<p>Since April 2017, most benefits provided through salary sacrifice are taxed on the higher of the salary given up and the normal benefit value. Cars with CO2 emissions of ${h.P.sacrifice.carMaxCo2NormalRules} g/km or less were left out of that rule, so an electric car or a plug-in hybrid under the limit is taxed on the list price times the appropriate percentage, however much salary you give up. That is what makes these schemes work. The April 2029 cap on NI-free sacrifice is about pension contributions only: the ${h.a('salary-sacrifice-2029-cap', 'guide to the cap')} explains it.</p>
<h2>What Budget 2026 added</h2>
<p>The ${h.src('gov_budget26', 'Budget of 28 October 2026')} announced that appropriate percentages for 2030/31 will be one point above 2029/30 in every band: ${h.pc(h.P.cars.announced2030.zero)} for zero emission cars, ${h.pc(h.P.cars.announced2030.hybrid)} for cars from 1 to 50 g/km, and other rates up by one point to a maximum of ${h.pc(h.P.cars.announced2030.max)}. Until a Finance Act sets them, the calculator stops at 2029/30. A lease that runs into 2030/31 should assume at least that rate.</p>
<h2>Before signing</h2>
<ul><li>Use the list price including options, not the discounted lease price.</li><li>Check the employer's early termination terms if you leave or go on long leave.</li><li>Ask whether your pension contributions are based on salary before or after the car deduction.</li><li>Make sure the sacrifice leaves your pay above the National Minimum Wage.</li></ul>
<p>The ${h.a('salary-sacrifice-car-calculator', 'salary sacrifice car calculator')} gives the monthly cost for your own figures and any of the four years. For pension sacrifice, see the ${h.a('salary-sacrifice-calculator', 'pension calculator for sacrifice')}.</p>
<h2>The benefit in kind on three cars, year by year</h2>
<p>A ${h.m(30000)} electric hatchback has a taxable benefit of ${h.m(Math.floor(30000 * h.P.cars.zero['2026/27']))} in ${h.P.taxYear} and ${h.m(Math.floor(30000 * h.P.cars.zero['2029/30']))} in 2029/30. A ${h.m(45000)} electric estate goes from ${h.m(Math.floor(45000 * h.P.cars.zero['2026/27']))} to ${h.m(Math.floor(45000 * h.P.cars.zero['2029/30']))}. A ${h.m(70000)} electric SUV goes from ${h.m(Math.floor(70000 * h.P.cars.zero['2026/27']))} to ${h.m(Math.floor(70000 * h.P.cars.zero['2029/30']))}. The tax is the benefit times your Income Tax rate: 20%, 40% or 45% in England, Wales and Northern Ireland, or the Scottish rates. Even at ${h.pc(h.P.cars.zero['2029/30'])}, an electric car is taxed at well under a quarter of the rate of a petrol car at the maximum.</p>
<h2>Plug-in hybrids in detail</h2>
<p>Hybrids from 1 to 50 g/km have five bands by electric range until 2027/28. A long-range plug-in hybrid with 130 miles or more pays the same as an electric car; one with under 30 miles pays ${h.pc(h.P.cars.hybrid['2026/27'][4].rate)}. From 2028/29 all of them pay ${h.pc(h.P.cars.hybrid['2028/29'][0].rate)}, under the ${h.src('leg_fa25_5', 'Finance Act 2025, section 5')}. A hybrid lease that starts in ${h.P.taxYear} and runs to 2029/30 therefore sees its rate more than double in the third year for a car with a mid-range battery. Cars above 50 g/km and up to ${h.P.sacrifice.carMaxCo2NormalRules} g/km keep the normal rules under salary sacrifice but have higher percentages.</p>
<h2>List price, options and accessories</h2>
<p>The list price is the price of the car on the day before it was first registered, with VAT, delivery and any optional accessories fitted at the time. Discounts the employer or lessor negotiates do not reduce it. A capital contribution you make towards the car, up to ${h.m(5000)}, is deducted. Accessories added later count from the date they are fitted if they cost more than ${h.m(100)}. Charging cables and a home charger supplied with the car are part of the deal, not separate benefits, in most schemes.</p>
<h2>The employer's side</h2>
<p>The employer pays Class 1A NI at ${h.pc(h.P.ni.class1A)} on the taxable benefit and saves secondary Class 1 NI at ${h.pc(h.P.ni.employerRate)} on the salary given up. On a ${h.m(42000)} electric car with ${h.m(450)} a month sacrificed, that is ${h.m(Math.floor(42000 * h.P.cars.zero['2026/27']) * h.P.ni.class1A)} paid against ${h.m(5400 * h.P.ni.employerRate)} saved a year in ${h.P.taxYear}. As the rate rises, Class 1A grows, but the saving stays far larger, which is why employers keep offering the schemes.</p>
<h2>Ending a lease early</h2>
<p>Most schemes run for two to four years. If you leave the employer, the sacrifice ends and the employer usually passes on a termination charge unless the scheme has insurance for it. Some schemes waive the charge for redundancy, long-term sickness or parental leave; others let a new employee take the car over. The benefit in kind stops from the day the car is no longer available to you, and the tax for the year is reduced pro rata. Read the termination section of the scheme before you order, because it is where these schemes differ most.</p>
<h2>Scottish taxpayers and company cars</h2>
<p>Company car tax uses your own Income Tax rates, so a Scottish higher rate taxpayer pays 42% on the benefit, and the salary given up saves 42% as well. Between ${h.m(h.scotHigher)} and ${h.m(h.P.ni.upperEarningsLimit)}, the sacrifice also saves 8% NI, so the overall saving on a car scheme in that slice is larger than for an English taxpayer on the same pay. The car calculator has a Scotland setting under its advanced fields.</p>
<h2>Rates, at a glance</h2>
<p>For a quick check: electric cars ${h.pc(h.P.cars.zero['2026/27'])}, ${h.pc(h.P.cars.zero['2027/28'])}, ${h.pc(h.P.cars.zero['2028/29'])} and ${h.pc(h.P.cars.zero['2029/30'])} from ${h.P.taxYear} to 2029/30; long-range plug-in hybrids the same until 2027/28, then ${h.pc(h.P.cars.hybrid['2028/29'][0].rate)} and ${h.pc(h.P.cars.hybrid['2029/30'][0].rate)}. Multiply the list price by the rate, then by your Income Tax rate, for the yearly tax. The mini-calculator at the top does it for each year.</p>`;
  },
});
