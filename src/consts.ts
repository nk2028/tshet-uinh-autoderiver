import type { Dispatch, DispatchWithoutAction, SetStateAction } from "react";

import type ParameterSet from "./Classes/ParameterSet";
import type samples from "./samples";

export const qieyunExamplesURLPrefix = "https://cdn.jsdelivr.net/gh/nk2028/qieyun-examples@f9674f8/";
export const qieyunTextLabelURLPrefix = "https://cdn.jsdelivr.net/gh/nk2028/qieyun-text-label@2a2aa89/";

export const options = {
  convertArticle: "從輸入框中讀取文章，並注音",
  convertPresetArticle: "為預設文章注音",
  exportAllSmallRhymes: "導出所有小韻",
  compareSchemas: "比較多個方案，並導出相異小韻",
  exportAllSyllables: "導出所有音節",
  exportAllSyllablesWithCount: "導出所有音節，並計數",
};
export type Option = keyof typeof options;
export const allOptions = Object.entries(options) as [Option, string][];

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
