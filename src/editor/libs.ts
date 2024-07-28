import { readFileSync } from "fs";
import { join } from "path";

// https://parceljs.org/features/node-emulation/#inlining-fs.readfilesync
// NOTE May not work if `qieyun` is installed via symlink
export default {
  "qieyun.d.ts": readFileSync("node_modules/qieyun/index.d.ts", "utf-8"),
  "global.d.ts": readFileSync(join(__dirname, "types.d.ts"), "utf-8"),
};
