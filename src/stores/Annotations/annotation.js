import { types } from "mobx-state-tree";
import { TaskModel } from "../Tasks";
import { CustomJSON } from "../types";

export const Annotation = types.model("Annotation", {
  id: types.identifier,
  result: types.optional(types.array(CustomJSON), []),
  task: types.late(() => types.reference(TaskModel)),
  created_at: types.optional(types.maybeNull(types.string), null),
  updated_at: types.optional(types.maybeNull(types.string), null),
});
