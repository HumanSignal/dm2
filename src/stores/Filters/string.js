import { types } from "mobx-state-tree";

export const StringFilter = types
  .model("StringFilter", {
    stringValue: types.string,
  })
  .views((self) => ({
    get value() {
      return self.stringValue;
    },
  }))

  .actions((self) => ({
    update(val) {
      self.stringValue = val;
    },
  }));
