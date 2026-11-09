/**
 * Full calculator of a tool page (RECETTE §5, §17): fields on the first screen, result card beside them
 * (`data-resultat`), line by line, with a proportional bar, copy link and print. Driven by a spec of
 * `lib/tool-specs.ts`, which calls the tested engine. Hydration (§17.5): the first render uses the build
 * defaults; link parameters are applied in an effect, and the address changes only after a real input.
 * Naive testers, 2026-11-08 (trame): until the reader changes a field (or opens a shared link) the result
 * carries "Example, not your result yet"; the fold's title shows the current value of each folded field.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import StackedBar from '../ui/StackedBar';
import { getTool } from '../../lib/tool-specs';
import { readParams, num, updateURL } from '../../lib/url-state';
import type { MiniInput } from '../../lib/mini-types';
import MentionExemple from './MentionExemple';
import { resultatExemple } from '../../lib/libelles-trame';
import { valeurAffichee } from './MiniSim';

interface Props { kind: string; defaults?: Record<string, number>; methodHref: string; idPrefix?: string; embed?: boolean; noteHref?: string; actionHref?: string }

function pairs<T>(xs: T[]): T[][] { const out: T[][] = []; for (let i = 0; i < xs.length; i += 2) out.push(xs.slice(i, i + 2)); return out; }

export default function Calc({ kind, defaults = {}, methodHref, idPrefix = 'c', embed = false, noteHref, actionHref }: Props) {
  const spec = getTool(kind);
  const init = () => Object.fromEntries(spec.inputs.map((i) => [i.id, defaults[i.id] ?? i.def]));
  const [v, setV] = useState<Record<string, number>>(init);
  const [copied, setCopied] = useState(false);
  // Fields the reader changed; a shared link counts as the reader's own figures.
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  // Summary bar at the bottom of a phone screen: shown only once the whole calculator has scrolled above
  // the screen, so it never covers a field or its help (three naive testers out of three, 2026-11-09).
  const root = useRef<HTMLDivElement>(null);
  const [past, setPast] = useState(false);
  useEffect(() => {
    const el = root.current; if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setPast(!e.isIntersecting && e.boundingClientRect.bottom < 0));
    io.observe(el); return () => io.disconnect();
  }, []);
  useEffect(() => {
    const u = readParams(window.location.search);
    if (!u.toString()) return;
    setTouched({ lien: true });
    setV((o) => Object.fromEntries(Object.entries(o).map(([k, x]) => [k, num(u, k, x)])));
  }, []);
  useEffect(() => { updateURL(Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x]))); }, [v]);
  const out = useMemo(() => spec.run(v, touched), [v, spec, touched]);
  const set = (id: string) => (x: number) => { setV((o) => ({ ...o, [id]: x })); setTouched((o) => (o[id] ? o : { ...o, [id]: true })); };
  const fid = (id: string) => `${idPrefix}-${kind}-${id}`;
  const field = (i: MiniInput) => i.options
    ? <SelectField key={i.id} id={fid(i.id)} label={i.label} value={String(v[i.id])} onChange={(x) => set(i.id)(Number(x))} options={i.options} help={i.help} />
    : <NumberField key={i.id} id={fid(i.id)} label={i.label} value={v[i.id]} onChange={set(i.id)} unit={i.unit} max={i.max} decimals={i.decimals} help={i.help} />;
  const main = spec.inputs.filter((i) => !(i.advanced || i.avance)), adv = spec.inputs.filter((i) => i.advanced || i.avance);
  const share = () => { try { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard refused */ } };
  return (
    <div ref={root} data-chrome data-calc={kind} className="rechner border border-navy-300 bg-white p-4 sm:p-5">
      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,26rem)]">
        <form className="grid content-start gap-4" onSubmit={(e) => e.preventDefault()}>
          {spec.exemple && resultatExemple(touched) && <p data-exemple-suppose className="rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm text-amber-900">{spec.exemple(v)}</p>}
          {pairs(main).map((p, k) => <div key={k} className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 sm:gap-y-0">{p.map(field)}</div>)}
          {spec.formNote && noteHref && <p className="-mt-1 text-sm text-navy-700">{spec.formNote.text} <a href={noteHref} className="font-medium text-accent-700 underline underline-offset-2">{spec.formNote.link}</a></p>}
          {adv.length > 0 && (
            <details className="group border-t border-navy-200 pt-3">
              <summary className="cursor-pointer text-sm font-medium text-accent-700">{spec.advancedLabel ?? 'More options'}
                <span data-actuellement className="mt-0.5 block text-xs font-normal text-navy-600">Set to: {adv.map((i) => `${i.label}: ${valeurAffichee(i, v[i.id])}`).join(' · ')}</span></summary>
              <div className="mt-3 grid gap-4">{pairs(adv).map((p, k) => <div key={k} className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 sm:gap-y-0">{p.map(field)}</div>)}</div>
            </details>
          )}
        </form>
        <div data-resultat aria-live="polite" className="self-start border-l-4 border-accent-500 bg-accent-50 p-4">
          <MentionExemple lang="en" touched={touched} />
          <p className="text-sm font-medium text-navy-700">{out.head[0]}</p>
          <p className="tabular-nums mt-1 text-4xl font-bold text-navy-900">{out.head[1]}</p>
          {out.sub && <p className="mt-1 text-sm text-navy-800">{out.sub}</p>}
          <table className="ledger mt-3 w-full text-sm"><tbody>
            {out.rows.map((r) => <tr key={r[0]} className={r[2] === 'total' ? 'total' : undefined}><td className="pr-3 text-navy-700">{r[0]}</td><td className="tabular-nums text-right text-navy-900">{r[1]}</td></tr>)}
          </tbody></table>
          {out.bar && out.bar.total > 0 && <div className="mt-3"><StackedBar segments={out.bar.segments} total={out.bar.total} ariaPrefix={out.bar.aria} /></div>}
          {out.action && actionHref && <p className="mt-3"><a href={actionHref} data-action className="font-semibold text-accent-700 underline underline-offset-2">{out.action} →</a></p>}
          {(out.notes ?? []).map((n) => <p key={n} className="mt-2 text-xs text-navy-700">{n}</p>)}
        </div>
      </div>
      {!embed && past && <div aria-hidden="true" data-barre-resume className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-300 bg-white/95 px-4 py-2 text-sm text-navy-900 shadow-[0_-2px_6px_rgba(0,0,0,0.06)] lg:hidden print:hidden">{resultatExemple(touched) && <strong className="font-semibold">Example: </strong>}{out.sticky}</div>}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <button type="button" onClick={share} className="rounded border border-navy-300 px-3 py-1.5 font-medium text-navy-800 hover:bg-navy-50">{copied ? 'Link copied' : 'Copy a link to this result'}</button>
        <button type="button" onClick={() => window.print()} className="rounded border border-navy-300 px-3 py-1.5 font-medium text-navy-800 hover:bg-navy-50">Print</button>
        <a href={methodHref} className="text-accent-700 underline underline-offset-2">How this is calculated</a>
        <span className="text-xs text-navy-600">{spec.footnote}</span>
      </div>
    </div>
  );
}
