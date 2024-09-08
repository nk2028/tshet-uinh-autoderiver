import { languages } from "monaco-editor";
import TSWorker from "monaco-editor/esm/vs/language/typescript/ts.worker.js?worker&inline";
import { SuggestAdapter } from "monaco-editor/esm/vs/language/typescript/tsMode";

declare global {
  interface Window {
    MonacoEnvironment: {
      getWorker(): Worker;
    };
  }
}

self.MonacoEnvironment = {
  getWorker() {
    return new TSWorker();
  },
};

// https://github.com/microsoft/monaco-editor/issues/1077
const removeItems: Record<string, languages.CompletionItemKind> = {
  globalThis: languages.CompletionItemKind.Module,
  eval: languages.CompletionItemKind.Function,
  decodeURI: languages.CompletionItemKind.Function,
  decodeURIComponent: languages.CompletionItemKind.Function,
  encodeURI: languages.CompletionItemKind.Function,
  encodeURIComponent: languages.CompletionItemKind.Function,
  escape: languages.CompletionItemKind.Function,
  unescape: languages.CompletionItemKind.Function,
  debugger: languages.CompletionItemKind.Keyword,
};

const sortOrderChanges: Record<string, [languages.CompletionItemKind, string]> = {
  null: [languages.CompletionItemKind.Keyword, "*6"],
  undefined: [languages.CompletionItemKind.Variable, "*6"],
  NaN: [languages.CompletionItemKind.Variable, "*6"],
  parseInt: [languages.CompletionItemKind.Function, "*5"],
  parseFloat: [languages.CompletionItemKind.Function, "*5"],
  isFinite: [languages.CompletionItemKind.Function, "*5"],
  isNaN: [languages.CompletionItemKind.Function, "*5"],
};

const sortOrder: Partial<Record<languages.CompletionItemKind, string>> = {
  [languages.CompletionItemKind.Property]: "*1",
  [languages.CompletionItemKind.Function]: "*2",
  [languages.CompletionItemKind.Field]: "*2",
  [languages.CompletionItemKind.File]: "*3",
  [languages.CompletionItemKind.Keyword]: "*4",
  [languages.CompletionItemKind.Variable]: "*7",
  [languages.CompletionItemKind.Module]: "*7",
};

const originalProvideCompletionItems = SuggestAdapter.prototype.provideCompletionItems;

SuggestAdapter.prototype.provideCompletionItems = async function (...args) {
  let result: languages.CompletionList | undefined;
  try {
    result = await originalProvideCompletionItems.apply(this, args);
  } catch {
    // ignored
  }
  if (!result) result = { suggestions: [] };
  result.suggestions = result.suggestions.flatMap(item => {
    let { label } = item;
    label = typeof label === "string" ? label : label.label;
    const sortText =
      label in sortOrderChanges && sortOrderChanges[label][0] === item.kind
        ? sortOrderChanges[label][1]
        : sortOrder[item.kind];
    if (sortText) item.sortText = sortText;
    return removeItems[label] === item.kind ? [] : [item];
  });
  // console.table(result.suggestions.map(({ label, kind, sortText }) => ({ label, kind, sortText })));
  return result;
};
