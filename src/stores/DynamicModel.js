import { types } from "mobx-state-tree";

const registry = new Map();

export const DynamicModel = (name, columns) => {
  const modelProperties = {
    id: types.identifier,
  };

  const typeWrapper = (type) => types.optional(types.maybeNull(type), null);

  columns.forEach((col) => {
    let propertyType;
    switch (col.type) {
      case "Number":
        propertyType = typeWrapper(types.number);
        break;
      case "Boolean":
        propertyType = typeWrapper(types.boolean);
        break;
      default:
        propertyType = typeWrapper(types.string);
        break;
    }
    modelProperties[col.id] = propertyType;
  });
};
