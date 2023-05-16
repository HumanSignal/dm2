import { types } from "mobx-state-tree";
import { CustomJSON } from "./types";
import { FF_LOPS_E_3, isFF } from "../utils/feature-flags";

const registry = new Map();

export const registerModel = (name, model) => {
  registry.set(name, model);
};

export const DynamicModel = (name, columns, properties) => {
  const modelProperties = {};

  const typeWrapper = (type) => types.optional(types.maybeNull(type), null);

  columns?.forEach((col) => {
    if (col.parent || col.id === "id") return;

    let propertyType;

    switch (col.type) {
      case "Number":
        propertyType = typeWrapper(types.number);
        break;
      case "Boolean":
        propertyType = typeWrapper(types.boolean);
        break;
      case "List":
        propertyType = typeWrapper(CustomJSON);
        break;
      default:
        propertyType = typeWrapper(types.union(types.string, types.number));
        break;
    }
    modelProperties[col.id] = propertyType;
  });

  Object.assign(modelProperties, {
    id: isFF(FF_LOPS_E_3) ? (types.snapshotProcessor(types.identifier, {
      // from snapshot to instance
      preProcessor(sn) {
        return sn.toString();
      },
      // from instance to snapshot
      postProcessor(sn) {
        return sn.toString();
      },
    })) : types.identifierNumber,
    ...(properties ?? {}),
  });

  const model = types.model(name, modelProperties);

  registerModel(name, types.model(name, modelProperties));

  return model;
};

DynamicModel.get = (name) => {
  return registry.get(name);
};
