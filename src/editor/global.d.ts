declare module "monaco-editor/esm/vs/language/typescript/tsMode" {
  export class SuggestAdapter {
    provideCompletionItems(
      model: import("monaco-editor").editor.ITextModel,
      position: import("monaco-editor").Position,
      _context: import("monaco-editor").languages.CompletionContext,
      token: import("monaco-editor").CancellationToken
    ): Promise<import("monaco-editor").languages.CompletionList | undefined>;
  }
}

declare module "url:*" {
  const url: string;
  export default url;
}
