import type { Dispatch, DispatchWithoutAction, ReactChild, ReactPortal, SetStateAction } from "react";

import type { CustomNode } from "./Classes/CustomElement";
import type ParameterSet from "./Classes/ParameterSet";
import type samples from "./samples";
import type { 音韻地位 } from "qieyun";

//export const qieyunExamplesURLPrefix = "https://cdn.jsdelivr.net/gh/nk2028/qieyun-examples@dev-qieyun-0.15/";
export const qieyunExamplesURLPrefix = "https://raw.githubusercontent.com/nk2028/qieyun-examples/dev-qieyun-0.15/";
export const qieyunTextLabelURLPrefix = "https://cdn.jsdelivr.net/gh/nk2028/qieyun-text-label@dev-qieyun-0.15/";

export const newFileTemplate = /* js */ `
/* 在此輸入描述……
 * 
 * @author your_name
 */

/** @type { 音韻地位["屬於"] } */
const is = (...x) => 音韻地位.屬於(...x);
/** @type { 音韻地位["判斷"] } */
const when = (...x) => 音韻地位.判斷(...x);

if (!音韻地位) return [
  // 在此輸入方案選項……
];

`.trimStart();

export const defaultArticle =
  "遙襟甫暢，逸興(曉開三C蒸去)遄飛。爽籟發而清風(幫三C東平)生(生開三庚平)，纖歌凝(疑開三C蒸平)而白雲遏。" +
  "睢(心合三脂平)園綠竹，氣(溪開三C微去)凌彭澤之樽；鄴水朱華(匣合二麻平)，光(見合一唐平)照臨(來開三侵平)川之筆。" +
  "四美具，二難(泥開一寒平)并(幫三A清平)。窮睇(定開四齊去)眄(明四先去)於(影開三C魚平)中(知三東平)天，極娛(疑合三C虞平)遊於(影開三C魚平)暇日。" +
  "天高地迥，覺(見二江入)宇宙之無窮；興(曉開三C蒸去)盡(從開三真上)悲來，識(書開三蒸入)盈虛(曉開三C魚平)之有數(生合三虞去)。" +
  "望(明三C陽平)長(澄開三陽平)安於(影開三C魚平)日下(匣開二麻上)，目吳會(見合一泰去)於(影開三C魚平)雲間(見開二山平)。" +
  "地勢極而南溟(明四青平)深(書開三侵平)，天柱(澄合三虞上)高而北辰遠(云合三C元上)。關山難(泥開一寒平)越(云合三C元入)，誰悲失路之人。" +
  "萍水相(心開三陽平)逢，盡(從開三真上)是他鄉之客。懷帝閽而不(幫三C尤上)見(見開四先去)，奉宣室以何(匣開一歌平)年？";

export const codeFontFamily = `
  monospace, "CharisSILW", "Source Han Serif C", "Source Han Serif K", "Noto Serif CJK KR",
  "Source Han Serif SC", "Noto Serif CJK SC", "Source Han Serif", "Noto Serif CJK JP", "Source Han Serif TC",
  "Noto Serif CJK TC", "Noto Serif KR", "Noto Serif SC", "Noto Serif TC", "HanaMin", monospace, monospace`;

export const options = {
  convertArticle: "從輸入框中讀取文章，並注音",
  convertPresetArticle: "為預設文章注音",
  exportAllPositions: "導出所有音韻地位",
  compareSchemas: "比較多個方案，並導出結果相異的音韻地位",
  exportAllSyllables: "導出所有音節",
  exportAllSyllablesWithCount: "導出所有音節，並計數",
};
export type Option = keyof typeof options;
export const allOptions = Object.entries(options) as [Option, string][];

export function noop() {
  // no operation
}

export type MainState = Readonly<{
  schemas: SchemaState[];
  article: string;
  option: Option;
  convertVariant: boolean;
  syncCharPosition: boolean;
  activeSchemaName: string;
}>;

export type SchemaState = Readonly<{
  name: string;
  input: string;
  parameters: ParameterSet;
}>;

export type Entry = Readonly<{
  結果: Query[];
  擬音: CustomNode[];
}>;

export type Query = Readonly<{
  字頭: string;
  釋義: string;
  音韻地位: 音韻地位;
  反切?: string | null;
  韻目原貌?: string;
}>;

type Values<T> = T extends Record<PropertyKey, infer T> ? Values<T> : T;
export type Sample = Values<typeof samples>;
export type Folder = { [name: string]: Folder | Sample };

type UseGet<K extends string, T> = { [P in K]: T };
type UseSet<K extends string, T> = { [P in `set${Capitalize<K>}`]: Dispatch<SetStateAction<T>> };
type Use<K extends string, T> = UseGet<K, T> & UseSet<K, T>;

export type UseMainState = Use<"state", MainState>;
export type UseLoading = Use<"loading", boolean>;
export type UseOperation = UseGet<"operation", number> & { increaseOperation: DispatchWithoutAction };
export type UseSetSyncedArticle = UseSet<"syncedArticle", string[]>;

type ReactFragment = Iterable<ReactNode>; // No {} !!!
export type ReactNode = ReactChild | ReactFragment | ReactPortal | boolean | null | undefined;
