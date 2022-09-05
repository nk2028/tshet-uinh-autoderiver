import { Fragment, useState } from "react";

import { 資料 } from "qieyun";

import { css } from "@emotion/react";
import styled from "@emotion/styled";

import CustomElement from "../Classes/CustomElement";
import { noop } from "../consts";
import Ruby from "./Ruby";
import Tooltip from "./Tooltip";

import type { Entry } from "../consts";

const Wrapper = styled.div`
  padding-bottom: 3px;
`;
const Item = styled.p<{ textColor: string }>`
  margin: 2px 10px;
  white-space: pre-line;
  color: ${({ textColor }) => textColor};
  ${({ onClick }) =>
    onClick &&
    css`
      cursor: pointer;
      &:hover {
        color: #0078e7;
      }
    `}
`;
const Pronunciation = styled.span`
  white-space: nowrap;
`;
const Char = styled.span`
  font-size: 125%;
`;
const RubyWrapper = styled.span<{ textColor: string }>`
  display: inline-block;
  padding: 0 3px;
  color: ${({ textColor }) => textColor};
`;

type TooltipListener = (id: number, ch: string, 描述: string) => void;
let tooltipListener: TooltipListener = noop;
export function listenTooltip(listener: TooltipListener) {
  tooltipListener = listener;
}

export default function TooltipChar({
  id,
  ch,
  entries,
  preselected,
}: {
  id: number;
  ch: string;
  entries: Entry[];
  preselected: number;
}) {
  const [selected, setSelected] = useState(preselected);

  const resolved = selected !== -1;
  const currIndex = +resolved && selected;
  const { 擬音, 結果 } = entries[currIndex];
  const multiple = entries.length > 1;

  function onClick(charIndex: number, 描述: string) {
    return multiple
      ? () => {
          setSelected(charIndex);
          tooltipListener(id, ch, 描述);
        }
      : undefined;
  }

  return (
    <Tooltip
      element={
        <Wrapper>
          {entries.map(({ 擬音, 結果 }, index) => (
            <Item
              key={index}
              textColor={結果.some(({ 解釋 }) => !解釋) ? "#c00" : multiple && index === currIndex ? "#00f" : "black"}
              onClick={onClick(index, 結果[0].音韻地位.描述)}>
              <Pronunciation lang="och-Latn-fonipa">
                {CustomElement.render(擬音).map((item, index) => (
                  <Fragment key={index}>
                    {!!index && <span> / </span>}
                    {item}
                  </Fragment>
                ))}
              </Pronunciation>
              {結果.map((res, i) => {
                const { 字頭, 解釋, 音韻地位 } = res;
                const { 描述 } = 音韻地位;
                let 反切 = 資料.query音韻地位(音韻地位)[0]?.反切;
                反切 = 反切 ? `${反切}切 ` : "";
                return (
                  <Fragment key={i}>
                    {i ? <br /> : " "}
                    <span onClick={onClick(index, 描述)}>
                      <Char>{字頭}</Char> {描述} {反切 + 解釋}
                    </span>
                  </Fragment>
                );
              })}
            </Item>
          ))}
        </Wrapper>
      }>
      <RubyWrapper
        textColor={結果.some(({ 解釋 }) => !解釋) ? "#c00" : multiple ? (resolved ? "#708" : "#00f") : "black"}>
        <Ruby rb={ch} rt={CustomElement.render(擬音)} />
      </RubyWrapper>
    </Tooltip>
  );
}
