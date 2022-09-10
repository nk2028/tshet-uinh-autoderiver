import ParameterSet from "./Classes/ParameterSet";
import { defaultArticle } from "./consts";

import type { Parameter } from "./Classes/ParameterSet";
import type { MainState, Option } from "./consts";

export default function initialState(): MainState {
  const state = localStorage.getItem("state");
  if (state) {
    const result: MainState = JSON.parse(state);
    return {
      ...result,
      schemas: result.schemas.map(schema => ({
        ...schema,
        parameters: ParameterSet.from(schema.input).combine(schema.parameters),
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

  // TODO remove the following in 0.2.0 stable release (or when upgrading Qieyun to 0.14)

  const schemaNames: string[] = JSON.parse(localStorage.getItem("schemas") || "[]");
  const schemaInputs: string[] = JSON.parse(localStorage.getItem("inputs") || "[]");
  const schemaParameters: Parameter[][] = JSON.parse(localStorage.getItem("parameters") || "[]");

  return {
    schemas: schemaNames.length
      ? schemaNames.map((name, id) => ({
          id,
          name,
          input: schemaInputs[id],
          parameters: ParameterSet.from(schemaInputs[id]).combine(new ParameterSet(schemaParameters[id])),
        }))
      : [],
    article: localStorage.getItem("article") || defaultArticle,
    option: (localStorage.getItem("option") as Option) || "convertArticle",
    convertVariant: localStorage.getItem("convertVariant") === "true",
    syncCharPosition: localStorage.getItem("syncCharPosition") !== "false",
    activeSchemaName: "",
  };
}
