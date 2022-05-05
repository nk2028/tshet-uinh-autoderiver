import { readFileSync } from "fs";
import { join } from "path";

// https://parceljs.org/features/node-emulation/#inlining-fs.readfilesync
export default {
  "qieyun.js": readFileSync(join(__dirname, "../../node_modules/qieyun/index.js"), "utf-8"),
  "qieyun.js.map": readFileSync(join(__dirname, "../../node_modules/qieyun/index.js.map"), "utf-8"),
  "qieyun.d.ts": readFileSync(join(__dirname, "../../node_modules/qieyun/index.d.ts"), "utf-8"),
  "global.d.ts": readFileSync(join(__dirname, "./types.d.ts"), "utf-8"),
};
