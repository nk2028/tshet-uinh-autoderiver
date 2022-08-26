import { createElement, Fragment, ReactNode } from "react";

const nodeWithoutProp = ["f", "b", "i", "u", "s", "sup", "sub"] as const;
type NodeWithoutProp = typeof nodeWithoutProp[number];

const nodeWithProp = ["fg", "bg", "size"] as const;
type NodeWithProp = typeof nodeWithProp[number];

const TagStyle = { fg: "color", bg: "backgroundColor", size: "fontSize" } as const;

export type CustomNode = CustomElement | string;

export default class CustomElement {
  private children: CustomNode[] = [];

  constructor(
    private tag: [NodeWithoutProp] | [NodeWithProp, string],
    strings: TemplateStringsArray,
    ...args: CustomNode[]
  ) {
    strings.forEach((str, index) => {
      if (str) this.children.push(str);
      if (index < args.length) this.children.push(args[index]);
    });
  }

  toJSON() {
    return [...this.tag, ...this.children];
  }

  static isEqual(left: CustomNode, right: CustomNode): boolean;
  static isEqual(left: CustomNode[], right: CustomNode[]): boolean;
  static isEqual(left: CustomNode | CustomNode[], right: CustomNode | CustomNode[]) {
    return JSON.stringify(left) === JSON.stringify(right);
  }

  render(): ReactNode {
    const [tag, prop] = this.tag;
    return createElement(
      tag in TagStyle ? "span" : tag === "f" ? Fragment : tag,
      prop ? { style: { [TagStyle[tag as NodeWithProp]]: prop } } : undefined,
      ...CustomElement.render(this.children)
    );
  }

  static render(children: CustomNode[]) {
    return children.map(child => (child instanceof CustomElement ? child.render() : String(child)));
  }
}

type ConstructorFunction = (
  tag: [NodeWithoutProp] | [NodeWithProp, string],
  strings: TemplateStringsArray,
  ...args: CustomNode[]
) => CustomElement;

type TagAndArgs = ConstructorFunction extends (tag: infer T, ...args: infer A) => CustomElement ? [T, A] : never;
type Tag = TagAndArgs[0];
type Args = TagAndArgs[1];

type AllFormatters<T, R> = T extends [string, string?]
  ? { [P in T as T[0]]: P extends [string, infer U] ? (prop: U) => R : R }
  : never;
type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export type Formatter = UnionToIntersection<AllFormatters<Tag, (...args: Args) => CustomElement>>;
export const Formatter = {} as Formatter;

for (const tag of nodeWithoutProp) Formatter[tag] = (...args: Args) => new CustomElement([tag], ...args);
for (const tag of nodeWithProp)
  Formatter[tag] =
    (prop: string) =>
    (...args: Args) =>
      new CustomElement([tag, prop], ...args);
