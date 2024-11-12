import styled from "@emotion/styled";
import { faAngleDown, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { ReactNode } from "../consts";

const FolderItem = styled.summary`
  display: flex;
  align-items: center;
  outline: none;
  transition: color 100ms;
  list-style: none;
  &::-moz-focus-inner {
    border: none;
    padding: 0;
  }
  &::marker,
  &::-webkit-details-marker {
    display: none;
  }
  &:hover,
  &:focus {
    color: #0078e7;
  }
`;
const ExpandedIcon = styled(FontAwesomeIcon)`
  display: none;
  details[open] & {
    display: block;
  }
`;
const CollapsedIcon = styled(FontAwesomeIcon)`
  display: block;
  details[open] & {
    display: none;
  }
`;

export default function ExplorerFolder({ name, children }: { name: string; children: ReactNode }) {
  return (
    <li>
      <details open>
        <FolderItem>
          <ExpandedIcon icon={faAngleDown} fixedWidth />
          <CollapsedIcon icon={faAngleRight} fixedWidth />
          <span>{name}</span>
        </FolderItem>
        <ul>{children}</ul>
      </details>
    </li>
  );
}
