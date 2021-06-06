/*
Bug! Don't use this script!

import { readdirSync, readFileSync, writeFileSync } from "fs";

// This script aims to replace the escaped UTF-8 string to plain UTF-8 characters.
// Since qieyun-js uses UTF-8 strings heavily, escaping the strings will yield
// extremely large JavaScript artifacts. However, it seems that there is no way
// to prevent Babel from doing so.
// Ref: https://github.com/babel/minify/issues/619#issuecomment-408575395

function replaceOneFile(filename) {
  let code = readFileSync(filename, { encoding: "utf-8" });
  code = code.replace(/\\u([\d\w]{4})/gi, (m, g) => String.fromCharCode(parseInt(g, 16)));
  writeFileSync(filename, code);
}

readdirSync("./build/static/js")
  .filter(filename => filename.endsWith(".js"))
  .map(filename => `./build/static/js/${filename}`)
  .forEach(replaceOneFile);
*/
