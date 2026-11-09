/**
 * Mini-calculator (RECETTE §9.3): a few fields, the figure of the page's subject in large type, two to
 * four lines of detail and a link to the full calculator. The arithmetic is the engine's, through
 * `lib/mini-specs.ts`. First render = build defaults (§17.5). `primary`: main tool of a tool page
 * (result marked `data-resultat`, first screen); otherwise the form is `data-simulateur-secondaire`.
 *
 * Naive testers, 2026-11-08 (RECETTE §15.8, trame):
 * - the fields the reader changed are kept (`touched`, passed to `spec.run`); until one is changed the
 *   result carries "Example, not your result yet" (MentionExemple); `saisiParLeLecteur`: values from a
 *   shared link, already the reader's, no mention;
 * - `title`: two calculators stacked on one page each get their own title; `idPrefix` keeps ids unique;
 * - `avance` (or `advanced`) fields sit in a fold whose title shows the current value of each ("Now: …").
 */
import { useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import { getSpec } from '../../lib/mini-specs';
import MentionExemple from './MentionExemple';
import { libellesTrame, resumeRepli } from '../../lib/libelles-trame';
import { formatNumber } from '../../lib/format';
import type { MiniInput } from '../../lib/mini-types';

interface Props { kind: string; lang?: string; href?: string; title?: string; defaults?: Record<string, number>; primary?: boolean; idPrefix?: string; saisiParLeLecteur?: boolean }

export default function MiniSim({ kind, lang = 'en', href, title, defaults = {}, primary = false, idPrefix = 'm', saisiParLeLecteur = false }: Props) {
  const spec = getSpec(kind);
  const [v, setV] = useState<Record<string, number>>(() => Object.fromEntries(spec.inputs.map((i) => [i.id, defaults[i.id] ?? i.def])));
  const [touched, setTouched] = useState<Record<string, boolean>>(() => (saisiParLeLecteur ? Object.fromEntries(spec.inputs.map((i) => [i.id, true])) : {}));
  const out = useMemo(() => spec.run(v, touched), [v, spec, touched]);
  const set = (id: string) => (x: number) => { setV((o) => ({ ...o, [id]: x })); setTouched((o) => (o[id] ? o : { ...o, [id]: true })); };
  const fid = (id: string) => `${idPrefix}-${kind}-${id}`;
  const champ = (i: MiniInput) => (i.options
    ? <SelectField key={i.id} id={fid(i.id)} label={i.label} value={String(v[i.id])} onChange={(x) => set(i.id)(Number(x))} options={i.options} help={i.help} />
    : <NumberField key={i.id} id={fid(i.id)} label={i.label} value={v[i.id]} onChange={set(i.id)} unit={i.unit} max={i.max} decimals={i.decimals} help={i.help} />);
  const avances = spec.inputs.filter((i) => i.avance || i.advanced);
  return (
    <div data-chrome data-mini={kind} className={`not-prose rechner ${primary ? '' : 'my-8'} border border-navy-300 bg-white p-4 sm:p-5`}>
      <p className="font-serif text-lg font-semibold text-navy-900">{title ?? spec.title}</p>
      <div className="mt-3 grid gap-5 sm:grid-cols-2">
        <form className="grid content-start gap-3" onSubmit={(e) => e.preventDefault()} {...(primary ? {} : { 'data-simulateur-secondaire': '' })}>
          {spec.inputs.filter((i) => !(i.avance || i.advanced)).map(champ)}
          {avances.length > 0 && (
            <details data-repli className="border-t border-navy-200 pt-3">
              <summary className="cursor-pointer text-sm font-semibold text-navy-800">{libellesTrame(lang).plusDeReglages}
                <span data-actuellement className="mt-0.5 block text-xs font-normal text-navy-600">{resumeRepli(lang, avances.map((i) => ({ label: i.label, valeur: valeurAffichee(i, v[i.id]) })))}</span></summary>
              <div className="mt-3 grid gap-3">{avances.map(champ)}</div>
            </details>
          )}
        </form>
        <div aria-live="polite" {...(primary ? { 'data-resultat': '' } : {})} className="self-start border-l-4 border-accent-500 bg-accent-50 p-4">
          <MentionExemple lang={lang} touched={touched} />
          <p className="text-sm font-medium text-navy-700">{out.head[0]}</p>
          <p className="tabular-nums mt-1 text-4xl font-bold text-navy-900">{out.head[1]}</p>
          <table className="ledger mt-3 w-full text-sm"><tbody>
            {out.rows.map(([l, x]) => <tr key={l}><td className="pr-3 text-navy-700">{l}</td><td className="tabular-nums text-right text-navy-900">{x}</td></tr>)}
          </tbody></table>
          {out.note && <p className="mt-2 text-xs text-navy-600">{out.note}</p>}
        </div>
      </div>
      {href && spec.cta && <a href={href} className="mt-4 inline-block text-sm font-medium text-accent-700 underline underline-offset-2 hover:text-accent-900">{spec.cta}</a>}
    </div>
  );
}

/** A field's value as the reader reads it: the chosen option's label, or the number and its unit. */
export function valeurAffichee(i: MiniInput, x: number): string {
  if (i.options) return i.options.find((o) => o.value === String(x))?.label ?? String(x);
  const n = formatNumber(x, Number.isInteger(x) ? 0 : (i.decimals ?? 0));
  // UK style: £1,200 and 4.5%, other units after a no-break space (12\u00a0yrs).
  return i.unit === '£' ? `£${n}` : i.unit === '%' ? `${n}%` : `${n}${i.unit ? `\u00a0${i.unit}` : ''}`;
}
