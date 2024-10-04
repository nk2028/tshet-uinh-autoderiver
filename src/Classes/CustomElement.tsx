import { createElement, Fragment } from "react";

import styled from "@emotion/styled";

import type { ReactNode } from "../consts";
import type { Property } from "csstype";
import type { HTMLAttributes, ReactElement } from "react";

const Missing = styled.span`
  &:after {
    content: "\xa0";
  }
`;

type TagToProp = {
  f: undefined;
  b: undefined;
  i: undefined;
  u: undefined;
  s: undefined;
  sub: undefined;
  sup: undefined;
  fg: Property.Color;
  bg: Property.BackgroundColor;
  size: Property.FontSize<string | number>;
};

type AllTags = keyof TagToProp;
type Tag = {
  [Tag in AllTags]: TagToProp[Tag] extends undefined ? readonly [Tag] : readonly [Tag, TagToProp[Tag]];
}[AllTags];
type Args = [strings: TemplateStringsArray | CustomNode, ...nodes: CustomNode[]];

const TagStyle = { fg: "color", bg: "backgroundColor", size: "fontSize" } as const;

export type CustomNode = CustomElement | string;

const isArray = (arg: unknown): arg is readonly unknown[] => Array.isArray(arg);
const isTagWithProp = (arg: AllTags): arg is keyof typeof TagStyle => arg in TagStyle;

export default class CustomElement {
  private tag: Tag;
  private children: readonly CustomNode[];

  constructor([tag, prop]: Tag, ...[strings, ...nodes]: Args) {
    this.tag = isTagWithProp(tag)
      ? [tag, tag === "size" && typeof prop === "number" ? (prop as never) : String(prop)]
      : [tag];
    const children: CustomNode[] = [];
    if (isArray(strings))
      strings.forEach((str, index) => {
        children.push(str);
        if (index < nodes.length) children.push(nodes[index]);
      });
    else children.push(strings, ...nodes);
    this.children = children.filter(child =>
      child instanceof CustomElement
        ? child.children.length
        : String(child) !== "" && typeof (child ?? false) !== "boolean",
    );
  }

  toJSON() {
    return [...this.tag, ...this.children];
  }

  private static normalize(node: CustomNode): CustomNode {
    return node instanceof CustomElement
      ? node.children.length
        ? node
        : ""
      : typeof (node ?? false) === "boolean"
        ? ""
        : String(node);
  }

  static stringify(node: CustomNode | readonly CustomNode[]) {
    node = isArray(node) ? node.map(CustomElement.normalize) : CustomElement.normalize(node);
    return JSON.stringify(node);
  }

  static isEqual(left: CustomNode, right: CustomNode): boolean;
  static isEqual(left: readonly CustomNode[], right: readonly CustomNode[]): boolean;
  static isEqual(left: CustomNode | readonly CustomNode[], right: CustomNode | readonly CustomNode[]) {
    return CustomElement.stringify(left) === CustomElement.stringify(right);
  }

  render(): ReactElement {
    const [tag, prop] = this.tag;
    return createElement(
      isTagWithProp(tag) ? "span" : tag === "f" ? Fragment : tag,
      isTagWithProp(tag) ? ({ style: { [TagStyle[tag]]: prop } } as HTMLAttributes<HTMLElement>) : undefined,
      ...CustomElement.renderInner(this.children),
    );
  }

  private static renderInner(children: readonly CustomNode[]) {
    return children.map<ReactNode>(child =>
      child instanceof CustomElement
        ? child.children.length
          ? child.render()
          : ""
        : typeof (child ?? false) === "boolean"
          ? ""
          : String(child),
    );
  }

  static render(children: readonly CustomNode[], fallback: ReactNode = <Missing />) {
    return CustomElement.renderInner(children).map<ReactNode>(child => (child === "" ? fallback : child));
  }
}

const TAGS = Symbol("TAGS");

type AllFormatters = {
  [Tag in AllTags]: TagToProp[Tag] extends undefined ? Formatter : (prop: TagToProp[Tag]) => Formatter;
};
export interface Formatter extends AllFormatters {
  (...args: Args): CustomElement;
}
interface FormatterWithTags extends Formatter {
  [TAGS]: Tag[];
}

function FormatterFactory(tags: Tag[]) {
  const instance = ((...args) => {
    let i = instance[TAGS].length - 1;
    let element = new CustomElement(instance[TAGS][i--] || ["f"], ...args);
    while (~i) element = new CustomElement(instance[TAGS][i--], element);
    return element;
  }) as FormatterWithTags;
  instance[TAGS] = tags;
  Object.setPrototypeOf(instance, FormatterFactory.prototype);
  return instance as Formatter;
}

Object.setPrototypeOf(FormatterFactory.prototype, Function.prototype);

for (const tag of ["f", "b", "i", "u", "s", "sup", "sub"] as const)
  Object.defineProperty(FormatterFactory.prototype, tag, {
    get() {
      return FormatterFactory([...this[TAGS], [tag]]);
    },
  });

for (const tag of ["fg", "bg", "size"] as const)
  Object.defineProperty(FormatterFactory.prototype, tag, {
    get() {
      return <T extends typeof tag>(prop: TagToProp[T]) => FormatterFactory([...this[TAGS], [tag, prop]]);
    },
  });

export const Formatter = FormatterFactory([]);
