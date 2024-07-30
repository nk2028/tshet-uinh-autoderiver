import ParameterSet from "./Classes/ParameterSet";
import { defaultArticle } from "./consts";

import type { MainState } from "./consts";

export const stateStorageLocation = "autoderiver/0.2/state";

export default function initialState(): MainState {
  const state = localStorage.getItem(stateStorageLocation);
  if (state) {
    const result: MainState = JSON.parse(state);
    return {
      ...result,
      schemas: result.schemas.map(schema => ({
        ...schema,
        parameters: ParameterSet.from(schema.input, schema.parameters as unknown as Record<string, unknown>).combine(
          schema.parameters,
        ),
      })),
    };
  }

  /*
  return {
    schemas: [],
    article: defaultArticle,
    option: "convertArticle",
    convertVariant: false,
    autocomplete: true,
    syncCharPosition: true,
    activeSchemaName: "",
  };
  */

  return {
    schemas: [],
    article: defaultArticle,
    option: "convertArticle",
    convertVariant: false,
    syncCharPosition: true,
    activeSchemaName: "",
  };
}
