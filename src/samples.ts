import { t } from "i18next";

export const samples = [
  "position",
  ["romanizationOrTranscription", "tupa", "baxter"],
  ["reconstruction", "karlgren", "wangli", "panwuyun", "unt", "unt_legacy", "msoeg_v8"],
  ["extrapolationOfLaterPeriods", "high_tang", "mid_tang", "n_song", "mongol", "zhongyuan"],
  ["extrapolationOfEarlyModernDialects", "onp"],
  ["extrapolationOfModernDialects", "putonghua", "gwongzau", "zaonhe"],
  ["artificial", "ayaka_v8", "yec_en_hua"],
] as const satisfies SampleDirTreeInternal;

export function localizedSampleName(id: SampleId): string {
  return t(`samples.name.${id}`, id);
}
export function localizedSampleCategoryName(id: string): string {
  return t(`samples.category.${id}`, id);
}

export type SampleDirTree = Entry[];
export type Entry = SampleId | SubDir;
export type SubDir = [string, ...Entry[]];
// NOTE same as above, but does not require an `Entry` string to be a `SampleId`.
// This is used for breaking the circular dependency of computing `SampleIds` and verifying that `samples` satisfies
// the `SampleDirTree` structure.
type SampleDirTreeInternal = EntryInternal[];
type EntryInternal = string | SubDirInternal;
type SubDirInternal = [string, ...EntryInternal[]];

export type SampleId = SampleIds<typeof samples>;

type SampleIds<T extends SampleDirTreeInternal> = {
  [K in keyof T]: T[K] extends SubDirInternal ? SampleIds<SubDirEntries<T[K]>> : T[K];
}[number];

type SubDirEntries<T extends SubDirInternal> = T extends readonly [string, ...infer Tail]
  ? Tail extends EntryInternal[]
    ? Tail
    : never
  : never;
