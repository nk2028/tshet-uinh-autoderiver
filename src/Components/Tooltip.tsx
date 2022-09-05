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
      const relativeToNodeBox = event.currentTarget.getBoundingClientRect();
      const oneRemSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const margin = oneRemSize / 4;

      render(element, div, () => {
        const divInnerBox = div.getBoundingClientRect();

        let targetTop = relativeToNodeBox.top - divInnerBox.height - margin;
        targetTop = targetTop < oneRemSize ? relativeToNodeBox.bottom + margin : targetTop;
        targetTop += window.pageYOffset;

        let targetLeft = (relativeToNodeBox.left + relativeToNodeBox.right - divInnerBox.width) / 2;
        targetLeft = Math.min(getPageWidth() - oneRemSize - divInnerBox.width, Math.max(oneRemSize, targetLeft));
        targetLeft += window.pageXOffset;

        div.style.top = targetTop + "px";
        div.style.left = targetLeft + "px";
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
