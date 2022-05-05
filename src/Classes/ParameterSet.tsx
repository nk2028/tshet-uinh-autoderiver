import styled from "@emotion/styled";

import Schema from "./Schema";

export type Arg = { key: string; value: unknown; options?: unknown[]; display: boolean };
export type Parameter = string | null | undefined | [key: string, value: unknown, display?: boolean];

const Colon = styled.span`
  &:after {
    content: ":";
    color: #888;
    margin: 0 0.5rem 0 0.375rem;
    vertical-align: 0.125rem;
  }
`;

export default class ParameterSet {
  private data = new Map<string, Arg>();
  private form: (string | null | undefined | Arg)[] = [];

  constructor(parameters: Parameter[] = []) {
    parameters.forEach(parameter => {
      if (Array.isArray(parameter)) {
        const [key, value, display] = parameter;
        if (!key || typeof key !== "string") return;
        const arg: Arg = { key, value, display: !(2 in parameter) || !!display };
        if (Array.isArray(value)) {
          arg.options = value.slice(1);
          const [current, first] = value;
          if (current && typeof current === "number" && current in value) arg.value = value[current];
          else if (arg.options.includes(current)) arg.value = current;
          else arg.value = first;
        } else if (!["boolean", "number", "string"].includes(typeof value)) return;
        this.data.set(key, arg);
        this.form.push(arg);
      } else this.form.push(parameter);
    });
  }

  get(key: string) {
    return this.data.get(key);
  }

  set(key: string, value: unknown) {
    const arg = this.get(key);
    if (arg && (arg.options ? arg.options.includes(value) : typeof value === typeof arg.value)) arg.value = value;
    return this;
  }

  pack(showAll?: boolean) {
    const result: Record<string, unknown> = {};
    this.data.forEach(({ value, display }, key) => {
      if (showAll || display) result[key] = value;
    });
    return result;
  }

  combine(old: ParameterSet | Record<string, unknown>) {
    if (old instanceof ParameterSet) old.data.forEach((arg, key) => this.set(key, arg.value));
    else Object.entries(old).forEach(item => this.set(...item));
    return this;
  }

  get size() {
    return this.data.size;
  }

  refresh(input: string) {
    if (!this.size) return ParameterSet.from(input);
    try {
      return new ParameterSet(new Schema(input).getParameters(this.pack(true))).combine(this);
    } catch {
      return this;
    }
  }

  static from(input: string) {
    try {
      return new ParameterSet(new Schema(input).getDefaultParameters());
    } catch {
      return new ParameterSet();
    }
  }

  render(onChange: (change: ParameterSet) => void) {
    return this.form.map(arg => {
      if (!arg || typeof arg === "string")
        return (
          <>
            <br />
            {"\n"}
            {!!arg && (
              <b>
                <span>{arg}</span>
                <Colon />
              </b>
            )}
          </>
        );
      const { key, value, options, display } = arg;
      if (!display) return null;
      if (options)
        return (
          <label key={key}>
            <span>{key}</span>
            <Colon />
            <select
              onChange={event => onChange(this.clone().set(key, options[+event.target.value]))}
              value={options.indexOf(value)}
              autoComplete="off">
              {options.map((option, index) => (
                <option key={index} value={index}>
                  {String(option) /* Using + "" will cause error with symbols */}
                </option>
              ))}
            </select>
          </label>
        );
      else
        switch (typeof value) {
          case "boolean":
            return (
              <label key={key}>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={event => onChange(this.clone().set(key, event.target.checked))}
                />
                <span>{key}</span>
              </label>
            );
          case "number":
            return (
              <label key={key}>
                <span>{key}</span>
                <Colon />
                <input
                  type="number"
                  value={value}
                  step="any"
                  onChange={event => onChange(this.clone().set(key, +event.target.value))}
                  autoComplete="off"
                />
              </label>
            );
          case "string":
            return (
              <label key={key}>
                <span>{key}</span>
                <Colon />
                <input
                  type="text"
                  value={value}
                  onChange={event => onChange(this.clone().set(key, event.target.value))}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
              </label>
            );
          default:
            return null;
        }
    });
  }

  clone() {
    // return Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
    const copy = new ParameterSet();
    copy.data = this.data;
    copy.form = this.form;
    return copy;
  }

  toJSON() {
    return this.pack(true);
  }
}
