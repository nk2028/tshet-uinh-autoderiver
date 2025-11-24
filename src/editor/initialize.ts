import { languages } from "monaco-editor";
import tsWorkerUrl from "monaco-editor/esm/vs/language/typescript/ts.worker.js?worker&url";
import { SuggestAdapter } from "monaco-editor/esm/vs/language/typescript/tsMode";

// NOTE Workaround for cross-origin loading.
// See: https://github.com/vitejs/vite/issues/13680#issuecomment-1819274694
// Normally we could just import the worker like `import TSWorker from "...?worker";` and then `new TSWorker()`,
// but it doesn't work if the assets are deployed on a different site.
const tsWorkerWrapperScript = `import ${JSON.stringify(new URL(tsWorkerUrl, import.meta.url))}`;
const tsWorkerWrapperBlob = new Blob([tsWorkerWrapperScript], { type: "text/javascript" });

self.MonacoEnvironment = {
  getWorker() {
    return new Worker(URL.createObjectURL(tsWorkerWrapperBlob), { type: "module" });
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

// eslint-disable-next-line @typescript-eslint/unbound-method -- intended for use with .apply
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
