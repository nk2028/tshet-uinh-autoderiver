import React from "react";
import ReactDOM from "react-dom";
import "./large-tooltip.css";

// https://stackoverflow.com/a/1038781
function getPageWidth() {
  return Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth
  );
}

function init() {
  const divOuter = document.createElement("div");
  divOuter.classList.add("large-tooltip-outer");
  const divInner = document.createElement("div");
  divInner.classList.add("large-tooltip-inner");
  divOuter.appendChild(divInner);
  divInner.classList.add("large-tooltip-hidden");
  document.body.appendChild(divOuter);

  return {
    addTooltip: (content: React.ReactElement, relativeToNode: Element) => {
      function showTooltip() {
        const relativeToNodeBox = relativeToNode.getBoundingClientRect();
        const relativeToNodeTop = relativeToNodeBox.top + window.pageYOffset;
        const relativeToNodeLeft = relativeToNodeBox.left + window.pageXOffset;

        ReactDOM.render(content, divInner);

        const divInnerBox = divInner.getBoundingClientRect();
        const divInnerHeight = divInnerBox.height;
        const divInnerWidth = divInnerBox.width;

        const targetTop = relativeToNodeTop - divInnerHeight;

        let targetLeft = relativeToNodeLeft - divInnerWidth / 2; // align center by default
        const oneEmSize = parseFloat(getComputedStyle(document.body).fontSize);
        // the distance to left margin of the page should be 1em or greater
        const miniumLeft = oneEmSize;
        // if left overflow, align left
        targetLeft = targetLeft < miniumLeft ? miniumLeft : targetLeft;
        // the distance to right margin of the page should be 1em or greater
        const maximumRight = getPageWidth() - oneEmSize - divInnerWidth;
        // if right overflow, align right
        targetLeft = targetLeft > maximumRight ? maximumRight : targetLeft;

        divInner.style.top = targetTop + "px";
        divInner.style.left = targetLeft + "px";

        divInner.classList.remove("large-tooltip-hidden");
      }
      function hideTooltip() {
        divInner.classList.add("large-tooltip-hidden");
      }
      relativeToNode.addEventListener("mouseenter", showTooltip, false);
      relativeToNode.addEventListener("touchstart", showTooltip, false);
      relativeToNode.addEventListener("mouseleave", hideTooltip, false);
      relativeToNode.addEventListener("touchend", hideTooltip, false);
    },
  };
}

const LargeTooltip = { init };

export default LargeTooltip;
