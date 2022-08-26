import { 表達式, 適配分析體系 } from "qieyun";

import { noop } from "../consts";
import { notifyError } from "../utils";
import { Formatter } from "./CustomElement";
import ParameterSet from "./ParameterSet";

import type { CustomNode } from "./CustomElement";
import type { Parameter } from "./ParameterSet";
import type { 音韻地位 } from "qieyun";

export type Require = (音韻地位: 音韻地位, 字頭?: string | null) => (sample: string) => UserSchema;

const 適配poem = 適配分析體系("poem");

const inner = new Proxy(
  {},
  {
    get(target, prop, reciver) {
      return prop in target ? Reflect.get(target, prop, reciver) : noop;
    },
  }
);
const proxy = new Proxy(
  {},
  {
    get(target, prop, reciver) {
      return prop in target ? Reflect.get(target, prop, reciver) : inner;
    },
  }
);

export default class Schema {
  private readonly input: {
    (音韻地位: null, 字頭: null, 選項: Record<string, unknown>, require: null): Parameter[];
    (音韻地位: 音韻地位, 字頭: string | null, 選項: Record<string, unknown>, require: (sample: string) => UserSchema):
      | string
      | ((formatter: Formatter) => CustomNode);
  };
  private readonly isLegacy: boolean;

  constructor(input: string) {
    this.input = new Function("音韻地位", "字頭", "選項", "require", input) as typeof this.input;
    for (const parameter of this.getParameters())
      if (Array.isArray(parameter) && String(parameter[0]) === "$legacy") {
        this.isLegacy = !!parameter[1];
        return;
      }
    this.isLegacy = false;
  }

  derive(音韻地位: 音韻地位, 字頭: string | null = null, 選項: Record<string, unknown>, require: Require) {
    音韻地位 = 適配分析體系.v2extStrict(音韻地位);
    if (this.isLegacy) {
      音韻地位 = 適配poem(音韻地位);
      if (音韻地位.屬於`脣音 或 ${表達式.開合中立韻}`) 音韻地位 = 音韻地位.調整({ 呼: null });
      if (!音韻地位.屬於`${表達式.重紐母} (${表達式.重紐韻} 或 清韻)`) 音韻地位 = 音韻地位.調整({ 重紐: null });
    }
    try {
      const result = this.input(音韻地位, 字頭, 選項, require(音韻地位, 字頭));
      return typeof result === "function" ? result(Formatter) : result;
    } catch (err) {
      throw notifyError(
        字頭
          ? `推導「${字頭}」字（音韻地位：${音韻地位.描述}）時發生錯誤`
          : `推導「${音韻地位.描述}」音韻地位（字為 null）時發生錯誤`,
        err
      );
    }
  }

  getParameters(選項: Record<string, unknown> = proxy) {
    try {
      const result = this.input(null, null, 選項, null);
      return Array.isArray(result) ? result : [];
    } catch {
      return [];
    }
  }

  getDefaultParameters() {
    return this.getParameters(new ParameterSet(this.getParameters()).pack());
  }

  getDefaultOptions() {
    return new ParameterSet(this.getDefaultParameters()).pack();
  }

  extend(parameters: Parameter[]) {
    return this.getDefaultParameters().concat(parameters);
  }
}

export class UserSchema extends Schema {
  constructor(input: string, private require: Require, private 音韻地位: 音韻地位, private 字頭?: string | null) {
    super(input);
  }

  override derive(
    音韻地位: 音韻地位,
    字頭: string | null = null,
    選項: Record<string, unknown> = this.getDefaultOptions()
  ) {
    return super.derive(音韻地位, 字頭, 選項, this.require);
  }

  deriveThis(選項: Record<string, unknown> = this.getDefaultOptions()) {
    return super.derive(this.音韻地位, this.字頭, 選項, this.require);
  }
}
