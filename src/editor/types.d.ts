import * as Qieyun from "qieyun";

type Qieyun = typeof Qieyun;
type 音韻地位 = Qieyun.音韻地位;

declare global {
  const Qieyun: Qieyun;
  const 音韻地位: 音韻地位;
  const 字頭: string | null;
  const 選項: Record<string, unknown>;
  const is: 音韻地位["屬於"];
  const when: 音韻地位["判斷"];
  const require: (sample: string) => UserSchema;
}
