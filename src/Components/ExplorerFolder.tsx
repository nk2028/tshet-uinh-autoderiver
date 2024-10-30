import { faAngleDown, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { ReactNode } from "../consts";

export default function ExplorerFolder({ name, children }: { name: string; children: ReactNode }) {
  return (
    <li>
      <details open>
        <summary>
          <FontAwesomeIcon className="marker-open" icon={faAngleDown} fixedWidth />
          <FontAwesomeIcon className="marker-close" icon={faAngleRight} fixedWidth />
          <span>{name}</span>
        </summary>
        <ul>{children}</ul>
      </details>
    </li>
  );
}
