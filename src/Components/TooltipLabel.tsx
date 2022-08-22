import { useCallback, useRef, useState } from "react";
import type { ReactNode, SyntheticEvent } from "react";
import { createPortal } from "react-dom";

import styled from "@emotion/styled";

const dummyDiv = document.createElement("div");

function getPageWidth() {
  return Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth
  );
}

const Wrapper = styled.div`
  position: absolute;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 4px;
  box-shadow: 0 1px 4px 1px rgba(0, 0, 0, 0.37);
  color: #333;
  width: 25rem;
  max-width: calc(100vw - 2rem);
  z-index: 800;
  padding: 4px 0;
  &:hover {
    visibility: visible !important;
  }
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
  const ref = useRef(dummyDiv);
  const [visible, setVisible] = useState(false);
  const [style, setStyle] = useState({ top: 0, left: 0 });
  const showTooltip = useCallback(
    (event: SyntheticEvent) => {
      if (visible) return;
      setVisible(true);

      const { top: relativeToNodeTop, left: relativeToNodeLeft } = event.currentTarget.getBoundingClientRect();
      const { height: divInnerHeight, width: divInnerWidth } = ref.current.getBoundingClientRect();
      const top = relativeToNodeTop + window.pageYOffset - divInnerHeight - 6;

      const targetLeft = relativeToNodeLeft + window.pageXOffset - divInnerWidth / 2;
      const oneRemSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const left = Math.min(getPageWidth() - oneRemSize - divInnerWidth, Math.max(oneRemSize, targetLeft));

      setStyle({ top, left });
    },
    [visible]
  );
  const hideTooltip = useCallback(() => setVisible(false), []);
  const events = {
    onMouseEnter: showTooltip,
    onTouchStart: showTooltip,
    onMouseLeave: hideTooltip,
    onTouchEnd: hideTooltip,
  };
  return description.length ? (
    <span>
      {createPortal(
        <Wrapper ref={ref} style={{ ...style, visibility: visible ? "visible" : "hidden" }} {...events}>
          {description.map(line => (
            <p key={line}>{line}</p>
          ))}
        </Wrapper>,
        document.body
      )}
      <Option {...events}>{children}</Option>
    </span>
  ) : (
    <label>{children}</label>
  );
}
