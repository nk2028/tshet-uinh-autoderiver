import { Formatter } from "./CustomElement";
import ParameterSet from "./ParameterSet";
import { noop } from "../consts";
import { notifyError } from "../utils";

import type { CustomNode } from "./CustomElement";
import type { Parameter } from "./ParameterSet";
import type { 音韻地位 } from "qieyun";

export type Require = (音韻地位: 音韻地位, 字頭?: string | null) => (sample: string) => UserSchema;

const inner = new Proxy(
  {},
  {
    get(target, prop, reciver) {
      return prop in target ? Reflect.get(target, prop, reciver) : noop;
    },
  },
);
const proxy = new Proxy(
  {},
  {
    get(target, prop, reciver) {
      return prop in target ? Reflect.get(target, prop, reciver) : inner;
    },
  },
);

export default class Schema {
  private readonly input: {
    (音韻地位: null, 字頭: null, 選項: Record<string, unknown>, require: null): Parameter[];
    (
      音韻地位: 音韻地位,
      字頭: string | null,
      選項: Record<string, unknown>,
      require: (sample: string) => UserSchema,
    ): string | ((formatter: Formatter) => CustomNode);
  };

  constructor(input: string) {
    this.input = new Function("音韻地位", "字頭", "選項", "require", input) as typeof this.input;
  }

  derive(音韻地位: 音韻地位, 字頭: string | null = null, 選項: Record<string, unknown>, require: Require) {
    try {
      const result = this.input(音韻地位, 字頭, 選項, require(音韻地位, 字頭));
      return typeof result === "function" ? result(Formatter) : result;
    } catch (err) {
      throw notifyError(
        字頭
          ? `推導「${字頭}」字（音韻地位：${音韻地位.描述}）時發生錯誤`
          : `推導「${音韻地位.描述}」音韻地位（字為 null）時發生錯誤`,
        err,
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
  constructor(
    input: string,
    private require: Require,
    private 音韻地位: 音韻地位,
    private 字頭?: string | null,
  ) {
    super(input);
  }

  override derive(
    音韻地位: 音韻地位,
    字頭: string | null = null,
    選項: Record<string, unknown> = this.getDefaultOptions(),
  ) {
    return super.derive(音韻地位, 字頭, 選項, this.require);
  }

  deriveThis(選項: Record<string, unknown> = this.getDefaultOptions()) {
    return super.derive(this.音韻地位, this.字頭, 選項, this.require);
  }
}
