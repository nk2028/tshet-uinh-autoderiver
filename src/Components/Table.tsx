import { Fragment } from "react";

import type { ReactNode } from "react";

export default function Table({ head, body }: { head: ReactNode[]; body: ReactNode[][] }) {
  return (
    <table>
      <thead>
        <tr>
          {head.map((item, index) => (
            <Fragment key={index}>
              <th>{item}</th>
              <td hidden>{index < head.length - 1 ? "\t" : "\n"}</td>
            </Fragment>
          ))}
        </tr>
      </thead>
      <tbody>
        {body.map((row, i) => (
          <tr key={i}>
            {row.map((item, index) => (
              <Fragment key={index}>
                <td>{item}</td>
                <td hidden>{index < row.length - 1 ? "\t" : "\n"}</td>
              </Fragment>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
