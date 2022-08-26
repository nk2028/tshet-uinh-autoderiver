import { cloneElement, ReactElement, useCallback } from "react";
import type { SyntheticEvent } from "react";
import { render } from "react-dom";

import { css as stylesheet } from "@emotion/css";

function getPageWidth() {
  return Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth
  );
}

const div = document.createElement("div");
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

export default function Tooltip({ element, children }: { element: ReactElement; children: ReactElement }) {
  const showTooltip = useCallback(
    (event: SyntheticEvent) => {
      const { top: nodeTop, left: nodeLeft, width: nodeWidth } = event.currentTarget.getBoundingClientRect();
      const oneRemSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

      render(element, div, () => {
        const { height: divHeight, width: divWidth } = div.getBoundingClientRect();
        const top = nodeTop + window.pageYOffset - divHeight;
        const targetLeft = nodeLeft + window.pageXOffset + (nodeWidth - divWidth) / 2;
        const left = Math.min(getPageWidth() - oneRemSize - divWidth, Math.max(oneRemSize, targetLeft));

        div.style.top = top + "px";
        div.style.left = left + "px";
        div.style.visibility = "visible";
      });
    },
    [element]
  );
  const hideTooltip = useCallback(() => {
    div.style.visibility = "hidden";
  }, []);
  return cloneElement(children, {
    onMouseEnter: showTooltip,
    onTouchStart: showTooltip,
    onMouseLeave: hideTooltip,
    onTouchEnd: hideTooltip,
  });
}
