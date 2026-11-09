/** Writing helpers handed to every page: links, numbers from the engine, tables, sources. No figure is typed in a page. */
import { route, ROUTES } from '../i18n/routes';
import { P, type SourceKey } from './engine/params';
import * as T from './engine/tax';
import * as R from './engine/relief';
import * as A from './engine/allowance';
import * as C from './engine/car';
import * as F from './engine/forecast';
import { formatMoney, formatNumber, formatPercent, displayDate } from './format';
import { attributsTableau, etiquettes } from './tableaux';

const esc = (s: string | number) => String(s).replace(/&(?!(?:[a-z]+|#\d+);)/g, '&amp;').replace(/</g, '&lt;');
/** Column name as plain text, for the `data-label` of each cell (phone cards, lib/tableaux.ts). */
const attr = (s: string) => s.replace(/<[^>]*>/g, '').replace(/&(?!(?:[a-z]+|#\d+);)/g, '&amp;').replace(/"/g, '&quot;').trim();
/** Content table. From 3 columns it becomes a stack of cards under 768 px (`table.empile`, naive testers 2026-11-08). */
export function table(headers: string[], rows: Array<Array<string | number>>, caption?: string, align: Array<'l' | 'r'> = []) {
  const al = (i: number) => (align[i] === 'r' ? 'text-right' : 'text-left');
  const { classe } = attributsTableau('auto', headers.length);
  return `<div class="not-prose my-6 overflow-x-auto"><table class="journal w-full text-sm${classe ? ` ${classe}` : ''}">${caption ? `<caption class="mb-2 text-left text-sm text-navy-600">${caption}</caption>` : ''}<thead><tr>${headers.map((h, i) => `<th scope="col" class="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-navy-700 ${al(i)}">${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => { const lab = etiquettes(headers, r.length); return `<tr>${r.map((c, i) => `<td data-label="${attr(lab[i])}" class="tabular-nums border-b border-navy-100 px-3 py-2 text-navy-800 ${al(i)}">${typeof c === 'number' ? esc(formatNumber(c, 0)) : c}</td>`).join('')}</tr>`; }).join('')}</tbody></table></div>`;
}

export function helpers(strict = false) {
  const m = (n: number) => formatMoney(Math.round(n), 0);
  const m2 = (n: number) => formatMoney(n, 2);
  const pc = (x: number, d?: number) => { const v = Math.round(x * 10000) / 100; return formatPercent(x, d ?? (Number.isInteger(v) ? 0 : Number.isInteger(+(v * 10).toFixed(6)) ? 1 : 2)); };
  const a = (id: string, text: string) => {
    if (!ROUTES.some((r) => r.id === id)) { if (strict) throw new Error(`Unknown page id in a link: ${id}`); return text; }
    return `<a href="${route(id, 'en')}">${text}</a>`;
  };
  const I = P.income;
  const higherStart = I.personalAllowance + I.ruk[0].upTo!;
  const relief = R.relief;
  /** Rows: contribution → cost under each method for one salary (gross into the pension from your pay). */
  const methodsTable = (salary: number, grosses: number[], nation: T.Nation = 'ruk', caption?: string) => {
    const rows = grosses.map((g) => { const c = R.compareMethods(salary, g, nation);
      return [m(g), m(c.ras.netCost), m(c.netpay.netCost), m(c.sacrifice.netCost), m(c.sacrifice2029.netCost), pc(c.ras.effectiveRate, 0)]; });
    return table(['Into the pension', 'Relief at source', 'Net pay', 'Salary sacrifice now', 'Sacrifice from April 2029', 'Relief (RAS)'], rows, caption ?? `What each gross contribution costs your take-home pay on a salary of ${m(salary)}, ${nation === 'scotland' ? 'Scotland' : 'England, Wales or Northern Ireland'}, ${P.taxYear}. Worked out by this site's engine from HMRC's 2026 to 2027 rates.`, ['l', 'r', 'r', 'r', 'r', 'r']);
  };
  return {
    P, T, R, A, C, F, I, higherStart, relief,
    /** Link to another page of the site by id. */
    a,
    m, m2, pc,
    num: (n: number) => formatNumber(n, 0),
    date: (iso: string) => displayDate(iso, 'en-GB'),
    table, methodsTable,
    /** Link to an official source of the parameter file. */
    src: (key: SourceKey, text?: string) => { const s = P.sources[key]; return `<a href="${s.url}" target="_blank" rel="nofollow noopener noreferrer">${text ?? s.label.en}</a>`; },
    /** Boxed note, press style. */
    box: (title: string, html: string) => `<div class="callout"><span class="callout-title">${title}</span>${html}</div>`,
    tax: (income: number, nation: T.Nation = 'ruk', ext = 0) => T.incomeTax(income, nation, ext).tax,
  };
}
export type Helpers = ReturnType<typeof helpers>;
