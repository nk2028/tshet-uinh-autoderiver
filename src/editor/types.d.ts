import TshetUinh from "tshet-uinh";

import type { SchemaFromRequire } from "../evaluate";

type TshetUinh = typeof TshetUinh;
type 音韻地位 = TshetUinh.音韻地位;

declare global {
  const TshetUinh: TshetUinh;
  const 音韻地位: 音韻地位;
  const 字頭: string | null;
  const 選項: Record<string, unknown>;
  const require: (sample: string) => SchemaFromRequire;
}
