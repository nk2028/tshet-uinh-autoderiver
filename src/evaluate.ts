import { t } from "i18next";
import { 推導方案 } from "tshet-uinh-deriver-tools";

import { Formatter } from "./Classes/CustomElement";
import { tshetUinhTextLabelURLPrefix } from "./consts";
import { evaluateOption, getArticle, setArticle } from "./options";
import { fetchFile, isArray, normalizeFileName, notifyError } from "./utils";

import type { CustomNode, NestedCustomNode } from "./Classes/CustomElement";
import type { MainState } from "./consts";
import type { ReactNode } from "react";
import type { 音韻地位 } from "tshet-uinh";
import type { 原始推導函數, 推導函數 } from "tshet-uinh-deriver-tools";

type Require = (音韻地位: 音韻地位, 字頭?: string | null) => RequireFunction;
type RequireFunction = (sample: string) => SchemaFromRequire;

type NestedStringNode = string | readonly NestedStringNode[];
type DeriveResult = NestedStringNode | ((formatter: Formatter) => NestedCustomNode);

export function rawDeriverFrom(input: string): 原始推導函數<DeriveResult, [RequireFunction]> {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval -- intended
  return new Function("選項", "音韻地位", "字頭", "require", input) as 原始推導函數<DeriveResult, [RequireFunction]>;
}

function formatResult(result: DeriveResult): CustomNode {
  const node = typeof result === "function" ? result(Formatter) : result;
  return isArray(node) ? Formatter.f(node) : node;
}

export default async function evaluate(state: MainState): Promise<ReactNode> {
  const { schemas, option } = state;

  if (option === "convertPresetArticle" && !getArticle())
    setArticle(await fetchFile(tshetUinhTextLabelURLPrefix + "index.txt"));
  else if (option === "compareSchemas" && schemas.length < 2)
    throw notifyError(t("dialog.error.message.multipleSchemasRequired"));
  else await new Promise(resolve => setTimeout(resolve));

  try {
    const derivers: [derive: 推導函數<DeriveResult, [RequireFunction]>, require: Require][] = schemas.map(
      ({ name, input, parameters }) => {
        const schema = new 推導方案(rawDeriverFrom(input));
        const options = parameters.pack();
        return [schema(options), require(name)];
      },
    );
    return evaluateOption[option](state, (地位, 字頭) =>
      derivers.map(([derive, require]) => formatResult(derive(地位, 字頭, require(地位, 字頭)))),
    );
  } catch (err) {
    throw notifyError(t("dialog.error.message.runtime"), err);
  }

  function require(current: string, references: string[] = []): Require {
    const newReferences = references.concat(current);
    if (references.includes(current))
      throw notifyError(`${t("dialog.error.message.circularReferenceDetected")} ${newReferences.join(" -> ")}`);
    return (音韻地位, 字頭) => sample => {
      const schema = schemas.find(({ name }) => name === normalizeFileName(sample));
      if (!schema) throw notifyError(t("dialog.error.message.schemaNameLookup"));
      return new SchemaFromRequire(rawDeriverFrom(schema.input), require(sample, newReferences), 音韻地位, 字頭);
    };
  }
}

export class SchemaFromRequire {
  private _schema: 推導方案<DeriveResult, [RequireFunction]>;
  constructor(
    rawDeriver: 原始推導函數<DeriveResult, [RequireFunction]>,
    private _require: Require,
    private _音韻地位: 音韻地位,
    private _字頭: string | null = null,
  ) {
    this._schema = new 推導方案(rawDeriver);
  }

  derive(音韻地位: 音韻地位, 字頭: string | null = null, 選項?: Readonly<Record<string, unknown>>) {
    return this._schema(選項)(音韻地位, 字頭, this._require(音韻地位, 字頭));
  }

  deriveThis(選項?: Readonly<Record<string, unknown>>) {
    return this.derive(this._音韻地位, this._字頭, 選項);
  }
}
