import * as Qieyun from "qieyun";

import { loader } from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";

import libs from "./libs";

window.Qieyun = Qieyun;
loader.config({ "vs/nls": { availableLanguages: { "*": "zh-tw" } } });

export default function setupMonaco(monaco: Monaco) {
  const defaults = monaco.languages.typescript.javascriptDefaults;
  defaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    allowJs: true,
    allowNonTsExtensions: true,
    baseUrl: "./",
    lib: ["esnext"],
  });
  defaults.setExtraLibs(Object.entries(libs).map(([filePath, content]) => ({ filePath, content })));
}
