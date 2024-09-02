import * as monaco from "monaco-editor";
import TshetUinh from "tshet-uinh";

import { loader } from "@monaco-editor/react";

import "./initialize";
import libs from "./libs";

declare global {
  interface Window {
    monaco: typeof monaco;
    TshetUinh: typeof TshetUinh;
  }
}

self.monaco = monaco;
self.TshetUinh = TshetUinh;

loader.config({ monaco });

const defaults = monaco.languages.typescript.javascriptDefaults;
defaults.setCompilerOptions({
  target: monaco.languages.typescript.ScriptTarget.ESNext,
  allowJs: true,
  allowNonTsExtensions: true,
  baseUrl: "./",
  lib: ["esnext"],
});
defaults.setExtraLibs(Object.entries(libs).map(([filePath, content]) => ({ filePath, content })));

document.fonts.ready.then(() => monaco.editor.remeasureFonts());
