import { types } from "mobx-state-tree";

export const NumberFilter = types
  .model("NumberFilter", {
    numValue: types.number,
  })
  .views((self) => ({
    get value() {
      return self.numValue;
    },
  }))
  .actions((self) => ({
    update(val) {
      self.numValue = val;
    },
  }));
