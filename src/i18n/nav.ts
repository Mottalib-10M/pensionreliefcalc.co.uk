import { route, type Locale } from './routes';
import { PAGES, pageById } from '../lib/guides';
import type { Group } from '../lib/guide-types';
export interface NavLink { href: string; label: string } export interface NavCategory { label: string; links: NavLink[] }
const CORE: Record<string, string> = { home: 'Pension tax relief calculator', method: 'How the sums are done', about: 'About', widget: 'Embed the calculator', contact: 'Contact', editorial: 'Editorial policy', privacy: 'Privacy', terms: 'Legal notice', cookies: 'Cookies' };
const GROUP_LABEL: Record<Group, string> = { relief: 'Tax relief', allowances: 'Allowances', sacrifice: 'Sacrifice', retirement: 'Retirement', salary: 'By salary', cars: 'Company cars (not pensions)' };
const GROUP_LONG: Record<Group, string> = { relief: 'Tax relief: how it works and how to claim', allowances: 'Allowances: annual allowance and carry forward', sacrifice: 'Sacrifice: pension salary sacrifice', retirement: 'Retirement: pension pot and drawdown', salary: 'By salary: relief worked out', cars: 'Company cars: salary sacrifice for a car, not a pension' };
export const GROUPS_ORDER: Group[] = ['relief', 'allowances', 'sacrifice', 'retirement', 'salary', 'cars'];
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
