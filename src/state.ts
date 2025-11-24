import ParameterSet from "./Classes/ParameterSet";
import { defaultArticle } from "./consts";

import type { MainState } from "./consts";

export const stateStorageLocation = "autoderiver/0.2/state";

function defaultState(): MainState {
  return {
    schemas: [],
    article: defaultArticle,
    option: "convertArticle",
    convertVariant: false,
    syncCharPosition: true,
    activeSchemaName: "",
    optionPanelHeight: 0.5,
  };
}

export default function initialState(): MainState {
  const state = localStorage.getItem(stateStorageLocation);
  if (state) {
    const result = JSON.parse(state) as MainState;
    return {
      ...defaultState(),
      ...result,
      schemas: result.schemas.map(schema => ({
        ...schema,
        parameters: ParameterSet.from(schema.input, schema.parameters as unknown as Record<string, unknown>).combine(
          schema.parameters,
        ),
      })),
    };
  }
  return defaultState();
}
