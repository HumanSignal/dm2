import { types } from "mobx-state-tree";

export const ThresholdModel = types
  .model("ThresholdModel", {
    from: types.optional(types.number, 0),
    to: types.optional(types.number, 100),
  });
