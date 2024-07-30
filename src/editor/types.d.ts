import Qieyun from "qieyun";

import type { SchemaFromRequire } from "../evaluate";

type Qieyun = typeof Qieyun;
type 音韻地位 = Qieyun.音韻地位;

declare global {
  const Qieyun: Qieyun;
  const 音韻地位: 音韻地位;
  const 字頭: string | null;
  const 選項: Record<string, unknown>;
  const require: (sample: string) => SchemaFromRequire;
}
