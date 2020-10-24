import { types } from "mobx-state-tree";
import { NumberFilter, RangeNumberFilter, StringFilter } from "../Filters";

export const Field = types
  .model("Fields", {
    field: types.string,

    enabled: true,
    canToggle: false,

    source: types.optional(
      types.enumeration(["tasks", "annotations", "inputs"]),
      "tasks"
    ),

    filterState: types.maybeNull(
      types.union(
        { eager: false },
        StringFilter,
        NumberFilter,
        RangeNumberFilter
      )
    ),
  })
  .views((self) => ({
    get key() {
      return self.source + "_" + self.field;
    },
  }))
  .actions((self) => ({
    toggle() {
      self.enabled = !self.enabled;
    },
  }));
