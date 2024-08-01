import { 推導方案, 推導設定 } from "tshet-uinh-deriver-tools";

import styled from "@emotion/styled";

import TooltipLabel from "../Components/TooltipLabel";
import { rawDeriverFrom } from "../evaluate";

import type { GroupLabel, Newline, 設定項 } from "tshet-uinh-deriver-tools";

function isNewline(item: 設定項): item is Newline {
  return item.type === "newline";
}

function isGroupLabel(item: 設定項): item is GroupLabel {
  return item.type === "groupLabel";
}

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
  private _設定: 推導設定;

  constructor(parameters: 推導設定 | readonly 設定項[] = []) {
    this._設定 = parameters instanceof 推導設定 ? parameters : new 推導設定(parameters);
  }

  set(key: string, value: unknown): ParameterSet {
    return new ParameterSet(this._設定.with({ [key]: value }));
  }

  pack(): Readonly<Record<string, unknown>> {
    return this._設定.選項;
  }

  combine(old: ParameterSet | Readonly<Record<string, unknown>>): ParameterSet {
    if (old instanceof ParameterSet) {
      old = old.pack();
    }
    const resetKeys = new Set(this._設定.列表.flatMap(item => ("key" in item && item["reset"] ? [item.key] : [])));
    const actual = Object.fromEntries(Object.entries(old).filter(([k]) => !resetKeys.has(k)));
    return new ParameterSet(this._設定.with(actual));
  }

  get size() {
    return Object.keys(this._設定.選項).length;
  }

  refresh(input: string) {
    if (!this.size) return ParameterSet.from(input);
    let rawDeriver;
    try {
      rawDeriver = rawDeriverFrom(input);
    } catch {
      return this;
    }
    return new ParameterSet(new 推導方案(rawDeriver).方案設定(this.pack())).combine(this);
  }

  static from(input: string, 選項?: Readonly<Record<string, unknown>>) {
    let rawDeriver;
    try {
      rawDeriver = rawDeriverFrom(input);
    } catch {
      return new ParameterSet();
    }
    return new ParameterSet(new 推導方案(rawDeriver).方案設定(選項));
  }

  render(onChange: (change: ParameterSet) => void) {
    return this._設定.列表.map(item => {
      if (isNewline(item)) {
        return (
          <>
            <br />
            {"\n"}
          </>
        );
      } else if (isGroupLabel(item)) {
        const { text, description } = item;
        return (
          <>
            <br />
            {"\n"}
            <Title>{text}</Title>
            {description ? (
              <Description>
                {description.split(/[\n-\r\x85\u2028\u2029]+/u).map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </Description>
            ) : null}
          </>
        );
      } else {
        if (item["hidden"]) {
          return null;
        }
        const { key, text, description, value, options } = item;
        const disabled = !!item["disabled"];
        const label = text ?? key;
        if (options) {
          return (
            <TooltipLabel key={key} description={description}>
              <span>{label}</span>
              <Colon />
              <select
                onChange={event => onChange(this.set(key, options[+event.target.value].value))}
                value={options.findIndex(option => option.value === value)}
                disabled={disabled}
                autoComplete="off">
                {options.map((option, i) => {
                  const { value, text } = option;
                  return (
                    <option key={i} value={i}>
                      {text ?? String(value)}
                    </option>
                  );
                })}
              </select>
            </TooltipLabel>
          );
        } else {
          switch (typeof value) {
            case "boolean":
              return (
                <TooltipLabel key={key} description={description}>
                  <input
                    type="checkbox"
                    checked={value}
                    disabled={disabled}
                    onChange={event => onChange(this.set(key, event.target.checked))}
                  />
                  <span>{label}</span>
                </TooltipLabel>
              );
            case "number":
              return (
                <TooltipLabel key={key} description={description}>
                  <span>{label}</span>
                  <Colon />
                  <input
                    type="number"
                    value={value}
                    step="any"
                    disabled={disabled}
                    onChange={event => onChange(this.set(key, +event.target.value))}
                    autoComplete="off"
                  />
                </TooltipLabel>
              );
            case "string":
              return (
                <TooltipLabel key={key} description={description}>
                  <span>{label}</span>
                  <Colon />
                  <input
                    type="text"
                    value={value}
                    disabled={disabled}
                    onChange={event => onChange(this.set(key, event.target.value))}
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
        }
      }
    });
  }

  // NOTE For saving the state. Only the packed object is needed.
  toJSON() {
    return this.pack();
  }
}
