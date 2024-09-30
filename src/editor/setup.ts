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
defaults.setDiagnosticsOptions({
  noSemanticValidation: false,
  noSyntaxValidation: false,
  noSuggestionDiagnostics: false,
  onlyVisible: true,
  diagnosticCodesToIgnore: [1108], // A 'return' statement can only be used within a function body.
});
defaults.setCompilerOptions({
  target: monaco.languages.typescript.ScriptTarget.ESNext,
  allowJs: true,
  allowNonTsExtensions: true,
  baseUrl: "./",
  lib: ["esnext"],

  checkJs: true,
  strict: true,
  allowUnusedLabels: false,
  allowUnreachableCode: false,
  noImplicitOverride: true,
  noImplicitReturns: true,
  exactOptionalPropertyTypes: true,
  noFallthroughCasesInSwitch: true,
});
defaults.setExtraLibs(Object.entries(libs).map(([filePath, content]) => ({ filePath, content })));

document.fonts.ready.then(() => monaco.editor.remeasureFonts());
