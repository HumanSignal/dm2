import { types } from "mobx-state-tree";
import { InfiniteListItem } from "../../mixins/InfiniteList";
import { CustomJSON, StringOrNumber } from "../types";

export const AnnotationModelBase = types.model("AnnotationModelBase", {
  id: types.identifierNumber,
  result: types.optional(types.array(CustomJSON), []),
  task_id: types.integer,
  lead_time: types.optional(types.maybeNull(types.number), null),
  created_at: types.optional(types.maybeNull(StringOrNumber), null),
  updated_at: types.optional(types.maybeNull(StringOrNumber), null),
  source: types.optional(types.string, ""),
  was_cancelled: types.optional(types.boolean, false),
});

export const AnnotationModel = types.compose(
  "TaskModel",
  AnnotationModelBase,
  InfiniteListItem
);
