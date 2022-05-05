import * as Qieyun from "qieyun";

declare global {
  interface Window {
    Qieyun: typeof Qieyun;
  }
}
