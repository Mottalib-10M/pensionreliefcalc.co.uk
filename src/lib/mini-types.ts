/** Calculator types (RECETTE §9.3, §17). Mini-calculators live in `lib/mini-specs.ts`, full tools in `lib/tool-specs.ts`; both call the tested engine. */
export interface MiniInput { id: string; label: string; def: number; unit?: string; max?: number; decimals?: number; help?: string; options?: Array<{ value: string; label: string }>;
  /** Folded into "More …" (`advanced`, this site's name; `avance`, the trame's): the fold's title shows its current value. */
  advanced?: boolean; avance?: boolean }
export interface MiniOut { head: [string, string]; rows: Array<[string, string]>; note?: string }
export interface MiniSpec {
  title: string; cta: string; ctaPage?: string; inputs: MiniInput[];
  /** `touched`: the fields the reader has changed (naive testers, 2026-11-08). While it is empty the
   *  component shows "Example, not your result yet"; a spec may also use it to hold back a verdict. */
  run: (v: Record<string, number>, touched?: Record<string, boolean>) => MiniOut;
}
export interface Segment { label: string; value: number; color: string }
export interface ToolOut {
  head: [string, string]; sub?: string;
  rows: Array<[string, string] | [string, string, 'total']>;
  bar?: { segments: Segment[]; total: number; aria: string };
  notes?: string[];
  /** One line for the bar kept at the bottom of a phone screen. */
  sticky: string;
  /** Text of a link under the result to the page of `ToolSpec.action` (shown only when set). */
  action?: string;
}
export interface ToolSpec { inputs: MiniInput[]; advancedLabel?: string;
  /** Line under the form with a link to the page that answers a field the reader may not know (naive testers, 2026-11-09). */
  formNote?: { text: string; link: string; page: string; anchor?: string };
  /** What the example figures assume, in plain words, shown above the fields until the reader changes one (second round of naive testers, 2026-11-09). */
  exemple?: (v: Record<string, number>) => string;
  /** Page the result's `action` link goes to (e.g. how to claim). */
  action?: { page: string; anchor?: string };
  run: (v: Record<string, number>, touched?: Record<string, boolean>) => ToolOut; footnote: string }
