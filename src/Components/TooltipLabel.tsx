import styled from "@emotion/styled";

import Tooltip from "./Tooltip";

import type { ReactNode } from "../consts";

const Wrapper = styled.div`
  p {
    margin: 6px 12px;
    line-height: 1.6;
    white-space: pre-line;
  }
`;

const Option = styled.label`
  cursor: help;
  span:first-of-type {
    border-bottom: 1px dotted #aaa;
  }
`;

export default function TooltipLabel({
  description,
  children,
}: {
  description?: string | undefined;
  children: ReactNode;
}) {
  return typeof description === "string" && description ? (
    <Tooltip
      fixedWidth={false}
      element={
        <Wrapper>
          {description.split(/[\n-\r\x85\u2028\u2029]+/).map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </Wrapper>
      }>
      <Option>{children}</Option>
    </Tooltip>
  ) : (
    <label>{children}</label>
  );
}
