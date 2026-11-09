/** llms.txt (RECETTE §21): what the site is, where its figures come from, its main pages. Built from the data. */
import type { APIRoute } from 'astro';
import { PAGES } from '../lib/guides';
import { route } from '../i18n/routes';
import { SITE_URL, LAST_UPDATED } from '../data/site-config';
export const GET: APIRoute = () => {
  const lines = [
    '# Pension Relief Calc',
    '',
    `> UK pension tax relief worked out in the browser for 2026/27: relief at source (the 20% provider top-up and the higher rate claim), net pay (with the HMRC top-up for low earners since 2024/25) and salary sacrifice (Income Tax and Class 1 NI, and the £2,000 NI cap announced for 6 April 2029), for England, Wales and Northern Ireland and for the six Scottish rates. Annual allowance of £60,000, taper to £10,000, MPAA of £10,000, carry forward (Finance Act 2004 s.228A), the 60% band between £100,000 and £125,140, the High Income Child Benefit Charge, and electric car benefit in kind to 2029/30 (ITEPA 2003 s.139). Rules from GOV.UK, HMRC and legislation.gov.uk, last read ${LAST_UPDATED}. Published by Radif Partners, an independent publisher; not HMRC, not a pension provider, sells nothing.`,
    '',
    '## Calculators and guides',
    `- [Pension tax relief calculator](${SITE_URL}${route('home', 'en')}): cost of a contribution by method and salary, rest of UK and Scotland, with the claim back.`,
    ...PAGES.map((p) => `- [${p.nav}](${SITE_URL}${route(p.id, 'en')}): ${p.card}`),
    '',
    '## Method',
    `- [How the sums are done](${SITE_URL}${route('method', 'en')})`,
    `- [About](${SITE_URL}${route('about', 'en')})`,
  ];
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
