/** The parameter file, typed. Every statutory figure used by the engine or shown on a page is read here. */
import RAW from '../../data/params-2026.json';
export type SourceKey = keyof typeof RAW.sources;
export const P = RAW;
export type AllowanceYear = keyof typeof RAW.allowances.years;
export type CarYear = '2026/27' | '2027/28' | '2028/29' | '2029/30';
