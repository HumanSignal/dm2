import { flow, getRoot, types } from "mobx-state-tree";
import { CustomJSON } from "../types";

export const TaskModel = types
  .model("TaskModel", {
    id: types.identifierNumber,
    data: types.optional(CustomJSON, {}),
    accuracy: types.maybeNull(types.integer),
    is_labeled: types.optional(types.boolean, false),
    created_at: types.optional(types.maybeNull(types.string), null),
    updated_at: types.optional(types.maybeNull(types.string), null),
    overlap: types.optional(types.maybeNull(types.integer), null),
    project: types.optional(types.maybeNull(types.integer), null),

    /* TODO: might have need to be converted to a store at some point */
    completions: types.optional(types.array(CustomJSON), []),
    predictions: types.optional(types.array(CustomJSON), []),
  })
  .actions((self) => ({
    updateFromServer: flow(function* () {
      const remoteTask = yield getRoot(self).API.task({
        data: { id: self.id },
      });
      console.log({ remoteTask });

      for (let key in remoteTask) {
        self[key] = remoteTask[key];
      }

      return self;
    }),
  }));
