import { SuggestAdapter } from "monaco-editor/esm/vs/language/typescript/tsMode";
import TSWorker from "url:monaco-editor/esm/vs/language/typescript/ts.worker.js";

self.MonacoEnvironment = {
  getWorkerUrl() {
    return TSWorker;
  },
};

// https://github.com/microsoft/monaco-editor/issues/1077
const removeItems = {
  globalThis: 8,
  eval: 1,
  decodeURI: 1,
  decodeURIComponent: 1,
  encodeURI: 1,
  encodeURIComponent: 1,
  escape: 1,
  unescape: 1,
  debugger: 17,
};

const sortOrderChanges = {
  null: [17, "*6"],
  undefined: [4, "*6"],
  NaN: [4, "*6"],
  parseInt: [1, "*5"],
  parseFloat: [1, "*5"],
  isFinite: [1, "*5"],
  isNaN: [1, "*5"],
};

const sortOrder = {
  9: "*1",
  1: "*2",
  3: "*2",
  20: "*3",
  17: "*4",
  4: "*7",
  8: "*7",
};

const originalProvideCompletionItems = SuggestAdapter.prototype.provideCompletionItems;

SuggestAdapter.prototype.provideCompletionItems = async function (...args) {
  let result;
  try {
    result = await originalProvideCompletionItems.apply(this, args);
  } catch {
    result = { suggestions: [] };
  }
  result.suggestions = result.suggestions.flatMap(item => {
    item.sortText =
      (item.label in sortOrderChanges && sortOrderChanges[item.label][0] === item.kind
        ? sortOrderChanges[item.label][1]
        : sortOrder[item.kind]) || item.sortText;
    return removeItems[item.label] === item.kind ? [] : [item];
  });
  // console.table(result.suggestions.map(({ label, kind, sortText }) => ({ label, kind, sortText })));
  return result;
};
