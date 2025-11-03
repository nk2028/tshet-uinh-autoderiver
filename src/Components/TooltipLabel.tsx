import styled from "@emotion/styled";

import Tooltip from "./Tooltip";
import { renderDescriptionHTML } from "../utils";

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
  onHideTooltip,
}: {
  description?: string | undefined;
  children: ReactNode;
  onHideTooltip?: (() => void) | undefined;
}) {
  return typeof description === "string" && description ? (
    <Tooltip
      fixedWidth={false}
      element={<Wrapper>{renderDescriptionHTML(description)}</Wrapper>}
      onHideTooltip={onHideTooltip}>
      <Option>{children}</Option>
    </Tooltip>
  ) : (
    <label>{children}</label>
  );
}
