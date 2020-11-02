import { types } from "mobx-state-tree";
import { CustomJSON } from "../types";

export const TaskModel = types
  .model("TaskModel", {
    id: types.identifierNumber,
    data: types.optional(CustomJSON, {}),
    extra: types.optional(CustomJSON, {}),
    accuracy: types.maybeNull(types.integer),
    agreement: types.optional(types.number, 0),
    finished: types.optional(types.boolean, false),
    is_labeled: types.optional(types.boolean, false),
    created_at: types.optional(types.maybeNull(types.string), null),
    updated_at: types.optional(types.maybeNull(types.string), null),
    overlap: types.optional(types.maybeNull(types.integer), null),
    project: types.optional(types.maybeNull(types.integer), null),
    source: types.string,

    /* TODO: might have need to be converted to a store at some point */
    completions: types.optional(types.array(CustomJSON), []),
    predictions: types.optional(types.array(CustomJSON), []),
  })
  .views((self) => ({
    get lastCompletion() {
      return self.completions[self.completions.length - 1];
    },

    get lastPrediction() {
      return self.predictions[self.predictions.length - 1];
    },
  }))
  .actions((self) => ({
    update(newData) {
      for (let key in newData) self[key] = newData[key];
      return self;
    },
  }));
