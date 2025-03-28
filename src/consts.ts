import type { CustomNode } from "./Classes/CustomElement";
import type ParameterSet from "./Classes/ParameterSet";
import type samples from "./samples";
import type { Dispatch, DispatchWithoutAction, ReactChild, ReactPortal, SetStateAction } from "react";
import type { 資料 } from "tshet-uinh";

export const tshetUinhExamplesURLPrefix = "https://cdn.jsdelivr.net/gh/nk2028/tshet-uinh-examples@main/";
// export const tshetUinhExamplesURLPrefix = "https://raw.githubusercontent.com/nk2028/tshet-uinh-examples/main/";
export const tshetUinhTextLabelURLPrefix = "https://cdn.jsdelivr.net/gh/nk2028/tshet-uinh-text-label@main/";

export const newFileTemplate = /* js */ `
/* 在此輸入描述……
 * 
 * @author your_name
 */

/** @type { 音韻地位['屬於'] } */
const is = (...x) => 音韻地位.屬於(...x);
/** @type { 音韻地位['判斷'] } */
const when = (...x) => 音韻地位.判斷(...x);

if (!音韻地位) return [
  // 在此輸入方案選項；以下提供一些範本，方案設定格式：https://github.com/nk2028/tshet-uinh-deriver-tools/wiki/%E6%8E%A8%E5%B0%8E%E6%96%B9%E6%A1%88%E8%A8%AD%E5%AE%9A%E9%A0%85%E5%88%97%E8%A1%A8%E6%A0%BC%E5%BC%8F
  [`程式中使用的選項名稱（選擇性）|顯示的選項名稱
    換行後為選項描述（選擇性）
    可以加入更多行`,
    [2, '選項1', '選項2'],
  // ^ 表示預設值
  ],
  [`核取方塊選項
    預設值須為勾選（true）或不勾選（false）之一`, false],
];

function 聲母規則() {
  return when([
    // ['幫母', '幫母讀音'],
  ], '無聲母規則');
}

function 韻母規則() {
  return when([
  // 果攝
  // 假攝
  // 遇攝
  // 蟹攝
  // 止攝
  // 效攝
  // 流攝
  // 咸攝
  // 深攝
  // 山攝
  // 臻攝
  // 梗攝
  // 曾攝
  // 宕攝
  // 江攝
  // 通攝
  ], '無韻母規則');
}

function 聲調規則() {
  return when([
  
  ], '無聲調規則');
}

let 聲母 = 聲母規則();
let 韻母 = 韻母規則();
let 聲調 = 聲調規則();

//if (is`入聲`) {
  //if (韻母.endsWith('m')) 韻母 = 韻母.slice(0, -1) + 'p';
  //else if (韻母.endsWith('n')) 韻母 = 韻母.slice(0, -1) + 't';
  //else if (韻母.endsWith('ŋ')) 韻母 = 韻母.slice(0, -1) + 'k';
//}

return 聲母 + 韻母 + 聲調;
`.trimStart();

export const defaultArticle =
  "風(幫三C東平)煙俱淨，天山共(羣三C鍾去)色。從(從三鍾平)流飄(滂三A宵平)蕩(定開一唐上)，任(日開三侵平)意東西。" +
  "自富陽至桐廬一百許里，奇(羣開三B支平)山異水，天下(匣開二麻上)獨絕。\n" +
  "水皆縹碧，千丈見(見開四先去)底。游魚細石，直視(常開三脂上)無礙。急湍(透合一寒平)甚(常開三侵上)箭，猛浪(來開一唐去)若(日開三陽入)奔(幫一魂平)。\n" +
  "夾岸高山，皆生(生開三庚平)寒樹(常合三虞去)，負勢競上(常開三陽上)，互相(心開三陽平)軒邈，爭高直指，千百成峯。" +
  "泉水激(見開四青入)石，泠泠作(精開一唐入)響；好(曉開一豪上)鳥相(心開三陽平)鳴，嚶嚶成韻(云合三B真去)。" +
  "蟬則千轉(知合三仙去)不(幫三C尤上)窮，猨則百叫無絕。" +
  "鳶飛戾(來開四齊去)天者，望(明三C陽去)峯息心；經(見開四青平)綸(來合三真平)世務者，窺谷(見一東入)忘(明三C陽平)反(幫三C元上)。" +
  "橫(匣合二庚平)柯上(常開三陽上)蔽，在(從開一咍上)晝猶(以三尤平)昏；疏(生開三魚平)條交映(影開三B庚去)，有時見(見開四先去)日。";

export const codeFontFamily = `
  "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New",
  "Source Han Serif C", "Source Han Serif K", "Noto Serif CJK KR", "Source Han Serif SC",
  "Noto Serif CJK SC", "Source Han Serif", "Noto Serif CJK JP", "Source Han Serif TC", "Noto Serif CJK TC",
  "Noto Serif KR", "Noto Serif SC", "Noto Serif TC", "Jomolhari", "HanaMin", "CharisSILW", monospace, monospace`;

export const options = {
  convertArticle: "從輸入框中讀取文章，並注音",
  convertPresetArticle: "為預置文章注音",
  exportAllPositions: "導出所有音韻地位",
  compareSchemas: "比較多個方案，並導出結果相異的音韻地位",
  exportAllSyllables: "導出所有音節",
  exportAllSyllablesWithCount: "導出所有音節，並計數",
};
export type Option = keyof typeof options;
export const allOptions = Object.entries(options) as [Option, string][];

/** Characters invalid in file names on Windows */
// eslint-disable-next-line no-control-regex
export const invalidCharsRegex = /[\0-\x1f"*/:<>?\\|\x7f-\x9f]/g;

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
  optionPanelHeight: number;
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

export type Query = Readonly<Pick<資料.檢索結果, "字頭" | "音韻地位"> & Partial<資料.檢索結果>>;

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
