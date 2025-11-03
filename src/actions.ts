import ParameterSet from "./Classes/ParameterSet";

import type { MainState, SchemaState } from "./consts";

function schemaAction(
  schemaName: string,
  computeNewSchemaState: (state: SchemaState) => SchemaState,
): (state: MainState) => MainState {
  return state => {
    const schemas = [...state.schemas];
    const index = schemas.findIndex(schema => schema.name === schemaName);
    schemas[index] = computeNewSchemaState(schemas[index]);
    return { ...state, schemas };
  };
}

export default {
  addSchema: (schema: Omit<SchemaState, "parameters">) => (state: MainState) => {
    if (state.schemas.some(({ name }) => name === schema.name)) {
      return state;
    }
    return {
      ...state,
      schemas: [...state.schemas, { ...schema, parameters: ParameterSet.from(schema.input) }],
      activeSchemaName: schema.name,
    };
  },

  deleteSchema: (name: string) => (state: MainState) => {
    const schemas = [...state.schemas];
    const index = schemas.findIndex(schema => schema.name === name);
    schemas.splice(index, 1);
    return {
      ...state,
      schemas,
      activeSchemaName: schemas.length ? schemas[index - +(index >= schemas.length)].name : "",
    };
  },

  moveSchema: (name: string, targetIndex: number) => (state: MainState) => {
    const { schemas } = state;
    const index = schemas.findIndex(schema => schema.name === name);
    return {
      ...state,
      schemas:
        targetIndex < index
          ? [
              ...schemas.slice(0, targetIndex),
              schemas[index],
              ...schemas.slice(targetIndex, index),
              ...schemas.slice(index + 1),
            ]
          : [
              ...schemas.slice(0, index),
              ...schemas.slice(index + 1, targetIndex + 1),
              schemas[index],
              ...schemas.slice(targetIndex + 1),
            ],
    };
  },

  renameSchema: (name: string, newName: string) => (state: MainState) => {
    const schemas = [...state.schemas];
    const index = schemas.findIndex(schema => schema.name === name);
    schemas[index] = { ...schemas[index], name: newName };
    return { ...state, schemas, activeSchemaName: newName };
  },

  setSchemaInput: (name: string, input: string) =>
    schemaAction(name, schemaState => ({
      ...schemaState,
      input,
      parameters: schemaState.parameters?.refresh(input) ?? ParameterSet.from(input),
    })),

  setSchemaParameters: (name: string, parameters: ParameterSet) =>
    schemaAction(name, schemaState => ({
      ...schemaState,
      parameters: parameters.refresh(schemaState.input),
    })),

  recomputeSchemaParameters: (name: string) =>
    schemaAction(name, schemaState => ({
      ...schemaState,
      parameters: schemaState.parameters?.refresh(schemaState.input) ?? ParameterSet.from(schemaState.input),
    })),

  resetSchemaParameters: (name: string) =>
    schemaAction(name, schemaState => ({
      ...schemaState,
      parameters: ParameterSet.from(schemaState.input),
    })),
};
