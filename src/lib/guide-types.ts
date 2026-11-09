/**
 * One page = ONE data file in `src/content/pages/<id>.ts`: URL, snippets, H1, standfirst, citable block,
 * FAQ, body, sources, tool. Shared by every page of the site through `ContentPage.astro`.
 */
import type { SourceKey } from './engine/params';
import type { Helpers } from './helpers';

export type Group = 'relief' | 'allowances' | 'sacrifice' | 'retirement' | 'salary' | 'cars';
export interface FAQ { q: string; a: string }
/** `tool:<spec>` (a full calculator of `lib/tool-specs.ts`) or `mini:<spec>` (a mini-calculator of `lib/mini-specs.ts`); `props` sets the page defaults. */
export interface ToolDef { kind: string; props?: Record<string, string | number | boolean> }

export interface PageDef {
  id: string;
  group: Group;
  order: number;
  /** Main tool on the first screen: the page is a tool page (`data-outil`). */
  tool?: ToolDef;
  /** Mini-calculator placed after the citable block of a reading page. */
  mini?: ToolDef;
  related: string[];
  sources: SourceKey[];
  slug: string;
  nav: string;
  card: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  /** Citable block, 120 words or more, one paragraph (RECETTE §21). */
  resume: (h: Helpers) => string;
  faqs: (h: Helpers) => FAQ[];
  /** HTML. A mini-calculator can be placed inside with `<!--tool:mini:claim-->` or `<!--tool:mini:claim|{"salary":60000}-->`. */
  body: (h: Helpers) => string;
}
export const definePage = (g: PageDef): PageDef => g;
