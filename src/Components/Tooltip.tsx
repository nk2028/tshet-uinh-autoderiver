import { cloneElement, ReactElement, useCallback, useEffect, useRef } from "react";
import type { SyntheticEvent } from "react";
import { createRoot } from "react-dom/client";

import { css as stylesheet } from "@emotion/css";

function getPageWidth() {
  return Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth,
  );
}

const div = document.getElementById("tooltip") ?? document.createElement("div");
div.id = "tooltip";
div.style.visibility = "hidden";
div.className = stylesheet`
  position: absolute;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 4px;
  box-shadow: 0 1px 4px 1px rgba(0, 0, 0, 0.37);
  color: #333;
  width: 25rem;
  max-width: calc(100vw - 2rem);
  z-index: 800;
  &:hover {
    visibility: visible !important;
  }
`;
document.body.appendChild(div);
const root = createRoot(div);

let tooltipTarget: symbol | null = null;

function hideTooltip() {
  div.style.visibility = "hidden";
}

function TooltipAnchor({ relativeToNodeBox, children }: { relativeToNodeBox: DOMRect; children: ReactElement }) {
  useEffect(() => {
    const oneRemSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const margin = oneRemSize / 6;

    const divInnerBox = div.getBoundingClientRect();

    let targetTop = relativeToNodeBox.top - divInnerBox.height - margin;
    targetTop = targetTop < oneRemSize ? relativeToNodeBox.bottom + margin : targetTop;
    targetTop += window.scrollY;

    let targetLeft = (relativeToNodeBox.left + relativeToNodeBox.right - divInnerBox.width) / 2;
    targetLeft = Math.min(getPageWidth() - oneRemSize - divInnerBox.width, Math.max(oneRemSize, targetLeft));
    targetLeft += window.scrollX;

    div.style.top = targetTop + "px";
    div.style.left = targetLeft + "px";
    div.style.visibility = "visible";
  });

  return children;
}

export default function Tooltip({ element, children }: { element: ReactElement; children: ReactElement }) {
  const selfRef = useRef(Symbol("Tooltip"));
  const showTooltip = useCallback(
    (event: SyntheticEvent) => {
      const relativeToNodeBox = event.currentTarget.getBoundingClientRect();

      root.render(<TooltipAnchor relativeToNodeBox={relativeToNodeBox}>{element}</TooltipAnchor>);
      tooltipTarget = selfRef.current;
    },
    [element],
  );
  useEffect(
    () => () => {
      if (tooltipTarget === selfRef.current) {
        hideTooltip();
      }
    },
    [],
  );
  return cloneElement(children, {
    onMouseEnter: showTooltip,
    onTouchStart: showTooltip,
    onMouseLeave: hideTooltip,
    onTouchEnd: hideTooltip,
  });
}
