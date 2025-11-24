import { Fragment } from "react";

import type { ReactNode } from "react";

export default function Ruby({ rb, rt }: { rb: ReactNode; rt: ReactNode }) {
  return (
    <ruby>
      {rb}
      <rp>(</rp>
      <rt lang="och-Latn-fonipa">
        {Array.isArray(rt)
          ? rt.map((item, index) => (
              <Fragment key={index}>
                {!!index && (
                  <>
                    <span hidden> / </span>
                    <br />
                  </>
                )}
                {item}
              </Fragment>
            ))
          : rt}
      </rt>
      <rp>)</rp>
    </ruby>
  );
}
