import type { ReactNode } from "react";

import styled from "@emotion/styled";

import Tooltip from "./Tooltip";

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

export default function TooltipLabel({ description, children }: { description: string[]; children: ReactNode }) {
  return description.length ? (
    <Tooltip
      element={
        <Wrapper>
          {description.map(line => (
            <p key={line}>{line}</p>
          ))}
        </Wrapper>
      }>
      <Option>{children}</Option>
    </Tooltip>
  ) : (
    <label>{children}</label>
  );
}
