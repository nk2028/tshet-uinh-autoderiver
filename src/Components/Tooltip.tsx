import { cloneElement, useCallback, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";

import { css as stylesheet } from "@emotion/css";

import { stopPropagation } from "../utils";

import type { ReactElement, SyntheticEvent } from "react";

function getPageWidth() {
  return Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth,
  );
}

const tooltipStyle = stylesheet`
  position: absolute;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 4px;
  box-shadow: 0 1px 4px 1px rgba(0, 0, 0, 0.37);
  color: #333;
  min-width: 3rem;
  max-width: min(25rem, calc(100vw - 2rem));
  z-index: 800;
  &:hover,
  &:focus {
    visibility: visible !important;
  }
`;
const fixedWidthStyle = stylesheet`
  width: 25rem;
`;

const div = document.getElementById("tooltip") ?? document.createElement("div");
div.addEventListener("click", stopPropagation);
div.id = "tooltip";
div.style.visibility = "hidden";
div.className = tooltipStyle;
const root = createRoot(div);

let tooltipTarget: symbol | null = null;

function TooltipAnchor({
  relativeToNodeBox,
  children,
  fixedWidth,
}: {
  relativeToNodeBox: DOMRect;
  children: ReactElement;
  fixedWidth: boolean;
}) {
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

    div.className = tooltipStyle + (fixedWidth ? " " + fixedWidthStyle : "");
    div.style.top = targetTop + "px";
    div.style.left = targetLeft + "px";
    div.style.visibility = "visible";
  });

  return children;
}

export default function Tooltip({
  element,
  children,
  fixedWidth = true,
  onHideTooltip,
}: {
  element: ReactElement;
  children: ReactElement;
  fixedWidth?: boolean;
  onHideTooltip?: (() => void) | undefined;
}) {
  const selfRef = useRef(Symbol("Tooltip"));
  const boxRef = useRef<DOMRect | null>(null);

  const renderTooltip = useCallback(() => {
    (document.querySelector("dialog[open]") ?? document.body).appendChild(div);
    root.render(
      <TooltipAnchor relativeToNodeBox={boxRef.current!} fixedWidth={fixedWidth}>
        {element}
      </TooltipAnchor>,
    );
  }, [element, fixedWidth]);
  const showTooltip = useCallback(
    (event: SyntheticEvent) => {
      boxRef.current = event.currentTarget.getBoundingClientRect();
      renderTooltip();
      tooltipTarget = selfRef.current;
    },
    [renderTooltip],
  );
  useEffect(() => {
    if (tooltipTarget === selfRef.current && boxRef.current && div.style.visibility === "visible") {
      renderTooltip();
    }
  }, [renderTooltip]);

  const hideTooltip = useCallback(() => {
    div.style.visibility = "hidden";
    onHideTooltip?.();
  }, [onHideTooltip]);
  useEffect(
    () => () => {
      if (tooltipTarget === selfRef.current) {
        hideTooltip();
      }
    },
    [hideTooltip],
  );

  return cloneElement(children, {
    onMouseEnter: showTooltip,
    onTouchStart: showTooltip,
    onMouseLeave: hideTooltip,
    onTouchEnd: hideTooltip,
  });
}
