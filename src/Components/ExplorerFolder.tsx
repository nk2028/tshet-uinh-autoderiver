import { useReducer } from "react";

import { faAngleDown, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { ReactNode } from "../consts";

export default function ExplorerFolder({ name, children }: { name: string; children: ReactNode }) {
  const [expanded, toggleExpanded] = useReducer((expanded: boolean) => !expanded, true);
  return (
    <li>
      <div onClick={toggleExpanded}>
        <FontAwesomeIcon icon={expanded ? faAngleDown : faAngleRight} fixedWidth />
        <span>{name}</span>
      </div>
      <ul hidden={!expanded}>{children}</ul>
    </li>
  );
}
