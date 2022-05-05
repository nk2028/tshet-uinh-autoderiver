import ParameterSet from "./Classes/ParameterSet";

import type { MainState, SchemaState } from "./consts";

export default {
  addSchema: (schema: Omit<SchemaState, "parameters">) => (state: MainState) => ({
    ...state,
    schemas: [...state.schemas, { ...schema, parameters: ParameterSet.from(schema.input) }],
    activeSchemaName: schema.name,
  }),

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

  setSchemaInput: (name: string, input: string) => (state: MainState) => {
    const schemas = [...state.schemas];
    const index = schemas.findIndex(schema => schema.name === name);
    const newState = { ...schemas[index], input };
    newState.parameters = newState.parameters.refresh(input);
    schemas[index] = newState;
    return { ...state, schemas };
  },

  setSchemaParameters: (name: string, parameters: ParameterSet) => (state: MainState) => {
    const schemas = [...state.schemas];
    const index = schemas.findIndex(schema => schema.name === name);
    const newState = { ...schemas[index] };
    newState.parameters = parameters.refresh(newState.input);
    schemas[index] = newState;
    return { ...state, schemas };
  },

  resetSchemaParameters: (name: string) => (state: MainState) => {
    const schemas = [...state.schemas];
    const index = schemas.findIndex(schema => schema.name === name);
    const newState = { ...schemas[index] };
    newState.parameters = ParameterSet.from(newState.input);
    schemas[index] = newState;
    return { ...state, schemas };
  },
};
