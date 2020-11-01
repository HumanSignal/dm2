import { types } from "mobx-state-tree";

export const Field = types
  .model("Fields", {
    field: types.string,

    enabled: true,
    canToggle: false,

    source: types.optional(
      types.enumeration(["tasks", "annotations", "inputs"]),
      "tasks"
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
