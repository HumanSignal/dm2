import { types } from "@babel/core";

const registry = new Map();

export const DynamicModel = (name, columns) => {
  const modelProperties = {
    id: types.identifier,
  };

  columns.forEach((col) => {});
};
