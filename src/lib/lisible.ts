/**
 * Readability passes on a page's HTML (five rules of the naive testers, 2026-11-10).
 *
 * - `glose`: every trade word is explained where it is read, at its first appearance on each page, in brackets.
 *   The page's text is handed over in reading order (standfirst, summary, body), and one `Set` is shared, so a
 *   word explained in the standfirst is not explained again in the body. Headings, links, table headers and
 *   captions are left alone; a word already followed by a bracket is taken as explained.
 * - `sansRefLoi`: section numbers of Acts belong in the sources block, not in the running text. A bracketed
 *   link to legislation.gov.uk is removed (the page's source list keeps it).
 */
import { P } from './engine/params';
import { formatMoney } from './format';

const m = (n: number) => formatMoney(Math.round(n), 0);
const Y = P.allowances.years['2026/27'];

/** [pattern, explanation]. The pattern matches the word as written; the first match on the page gets the bracket. */
const TERMS: Array<[string, RegExp, string]> = [
  ['pa', /\bPersonal Allowance\b/, `the first ${m(P.income.personalAllowance)} you earn tax-free`],
  ['sa', /\bSelf Assessment(?: return)?\b/, 'the yearly tax return'],
  ['mpaa', /\bmoney purchase annual allowance\b|\bMPAA\b/, `the ${m(Y.mpaa!)} yearly limit once you have taken taxable money from a pension`],
  ['aa', /\bannual allowance\b/, `the most that can go into all your pensions in a year without a tax charge, ${m(Y.aa)} for most people`],
  ['gross', /\bgross\b(?! (?:pay|salary|income))/, 'the full amount going into the pension, tax relief included'],
  ['ani', /\badjusted net income\b/, 'your taxable income less pension payments'],
  ['taper', /\btaper(?:ed)?\b/, 'a gradual cut'],
  ['ras', /\brelief at source\b/i, 'paid from taxed money, topped up by the provider'],
  ['netpay', /\bnet pay\b/i, 'taken before tax'],
  ['sacrifice', /\bsalary sacrifice\b/i, 'part of your salary paid into the pension instead'],
  ['hicbc', /\bHigh Income Child Benefit Charge\b/, `tax that takes back Child Benefit above ${m(P.childBenefit.hicbcFrom)}`],
  ['basic', /\bbasic rate band\b/, 'income taxed at 20%'],
  ['threshold', /\bthreshold income\b/, 'roughly your income before pension payments'],
];

const SKIP = /^<(h[1-6]|a|summary|caption|th|script|style|button|label|option)\b/i;

export function glose(html: string, used: Set<string>): string {
  // Split into tags and text; keep a stack of skipped elements.
  const parts = html.split(/(<[^>]+>)/);
  let skip = 0;
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (!p) continue;
    if (p.startsWith('<')) {
      if (SKIP.test(p) && !p.endsWith('/>')) skip += 1;
      else if (/^<\/(h[1-6]|a|summary|caption|th|script|style|button|label|option)>/i.test(p)) skip = Math.max(0, skip - 1);
      continue;
    }
    if (skip > 0) continue;
    let t = p;
    for (const [key, re, gloss] of TERMS) {
      if (used.has(key)) continue;
      const mt = re.exec(t);
      if (!mt) continue;
      used.add(key);
      const end = mt.index + mt[0].length;
      if (/^\s*\(/.test(t.slice(end))) continue; // already explained
      t = `${t.slice(0, end)} (${gloss})${t.slice(end)}`;
    }
    parts[i] = t;
  }
  return parts.join('');
}

/** Removes a bracketed link to the legislation site from running text. */
export function sansRefLoi(html: string): string {
  return html.replace(/\s*\(<a href="https:\/\/www\.legislation\.gov\.uk[^"]*"[^>]*>[^<]*<\/a>\)/g, '');
}
