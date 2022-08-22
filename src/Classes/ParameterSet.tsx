import styled from "@emotion/styled";

import TooltipLabel from "../Components/TooltipLabel";
import Schema from "./Schema";

export type Arg = { key: string; description: string[]; value: unknown; options?: unknown[] };
export type Parameter = string | null | undefined | [key: string, value: unknown];

const Title = styled.b`
  &:before {
    content: "〔";
    color: #888;
    margin: 0 0.25rem 0 -0.5rem;
  }
  &:after {
    content: "〕";
    color: #888;
    margin: 0 0.25rem;
  }
`;

const Description = styled.div`
  margin: -0.5rem 0 -0.2rem;
  font-size: 0.875rem;
  color: #555;
  p {
    margin: 0.3rem 0;
    line-height: 1.6;
  }
`;

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
    for (const parameter of parameters) {
      if (Array.isArray(parameter)) {
        const [key, ...description] = String(parameter[0]).split(/[\n-\r\x85\u2028\u2029]+/);
        if (description.length && !description[description.length - 1]) description.pop();
        const value = parameter[1];
        if (!key || key === "$legacy") continue;
        const arg: Arg = { key, description, value };
        if (Array.isArray(value)) {
          arg.options = value.slice(1);
          const [current, first] = value;
          if (current && typeof current === "number" && current in value) arg.value = value[current];
          else if (arg.options.includes(current)) arg.value = current;
          else arg.value = first;
        } else if (!["boolean", "number", "string"].includes(typeof value)) continue;
        this.data.set(key, arg);
        this.form.push(arg);
      } else this.form.push(parameter);
    }
  }

  get(key: string) {
    const index = key.search(/[\n-\r\x85\u2028\u2029]/);
    return this.data.get(index === -1 ? key : key.slice(0, index));
  }

  set(key: string, value: unknown) {
    const arg = this.get(key);
    if (arg && (arg.options ? arg.options.includes(value) : typeof value === typeof arg.value)) arg.value = value;
    return this;
  }

  pack() {
    const result: Record<string, unknown> = {};
    this.data.forEach(({ value }, key) => {
      result[key] = value;
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
      return new ParameterSet(new Schema(input).getParameters(this.pack())).combine(this);
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
      if (!arg || typeof arg === "string") {
        const [title, ...description] = (arg || "").split(/[\n-\r\x85\u2028\u2029]+/);
        if (description.length && !description[description.length - 1]) description.pop();
        return (
          <>
            <br />
            {"\n"}
            {!!title && <Title>{title}</Title>}
            {!!description.length && (
              <Description>
                {description.map(line => (
                  <p key={line}>{line}</p>
                ))}
              </Description>
            )}
          </>
        );
      }
      const { key, description, value, options } = arg;
      if (options)
        return (
          <TooltipLabel description={description} key={key}>
            <span>{key}</span>
            <Colon />
            <select
              onChange={event => onChange(this.clone().set(key, options[+event.target.value]))}
              value={options.indexOf(value)}
              autoComplete="off">
              {options.map((option, index) => (
                <option key={index} value={index}>
                  {String(option)}
                </option>
              ))}
            </select>
          </TooltipLabel>
        );
      else
        switch (typeof value) {
          case "boolean":
            return (
              <TooltipLabel description={description} key={key}>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={event => onChange(this.clone().set(key, event.target.checked))}
                />
                <span>{key}</span>
              </TooltipLabel>
            );
          case "number":
            return (
              <TooltipLabel description={description} key={key}>
                <span>{key}</span>
                <Colon />
                <input
                  type="number"
                  value={value}
                  step="any"
                  onChange={event => onChange(this.clone().set(key, +event.target.value))}
                  autoComplete="off"
                />
              </TooltipLabel>
            );
          case "string":
            return (
              <TooltipLabel description={description} key={key}>
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
              </TooltipLabel>
            );
          default:
            return null;
        }
    });
  }

  clone() {
    const copy = new ParameterSet();
    copy.data = this.data;
    copy.form = this.form;
    return copy;
  }

  toJSON() {
    return this.pack();
  }
}
