import { route, type Locale } from './routes';
import { PAGES, pageById } from '../lib/guides';
import type { Group } from '../lib/guide-types';
export interface NavLink { href: string; label: string } export interface NavCategory { label: string; links: NavLink[] }
const CORE: Record<string, string> = { home: 'Pension tax relief calculator', method: 'How the sums are done', about: 'About', widget: 'Embed the calculator', contact: 'Contact', editorial: 'Editorial policy', privacy: 'Privacy', terms: 'Legal notice', cookies: 'Cookies' };
const GROUP_LABEL: Record<Group, string> = { relief: 'Tax relief', allowances: 'Allowances', sacrifice: 'Sacrifice', retirement: 'Retirement', salary: 'By salary' };
const GROUP_LONG: Record<Group, string> = { relief: 'Tax relief on contributions', allowances: 'Annual allowance and carry forward', sacrifice: 'Salary sacrifice: pension and car', retirement: 'Pension pot and drawdown', salary: 'Relief by salary' };
export const GROUPS_ORDER: Group[] = ['relief', 'allowances', 'sacrifice', 'retirement', 'salary'];
export const groupLabel = (g: Group, long = true) => (long ? GROUP_LONG[g] : GROUP_LABEL[g]);
export const label = (id: string, _lang: Locale = 'en') => CORE[id] ?? pageById(id)?.nav ?? id;
const link = (id: string, lang: Locale): NavLink => ({ href: route(id, lang), label: label(id, lang) });
const inGroup = (g: Group, lang: Locale) => [...(g === 'relief' ? [link('home', lang)] : []), ...PAGES.filter((p) => p.group === g).map((p) => link(p.id, lang))];
export function navCategories(lang: Locale): NavCategory[] {
  return GROUPS_ORDER.map((g) => ({ label: GROUP_LABEL[g], links: inGroup(g, lang) })).filter((c) => c.links.length);
}
export const navDirect = (_lang: Locale): NavLink[] => [];
export const footerColumns = (lang: Locale): NavCategory[] => [...GROUPS_ORDER.map((g) => ({ label: GROUP_LONG[g], links: inGroup(g, lang) })).filter((c) => c.links.length), { label: 'This site', links: ['method', 'about', 'contact', 'editorial', 'widget', 'terms', 'privacy', 'cookies'].map((i) => link(i, lang)) }];
export const popularLinks = (_lang: Locale): NavLink[] => [];
