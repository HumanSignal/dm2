const { types } = require("mobx-state-tree");

export const RangeNumberFilter = types
  .model("RangeNumberFilter", {
    startNum: types.number,
    endNum: types.number,
  })
  .views((self) => ({
    get value() {
      return [self.startNum, self.endNum];
    },
  }))
  .actions((self) => ({
    update([val1, val2]) {
      if (val1 !== null) self.startNum = val1;

      if (val2 !== null) self.endNum = val2;
    },
  }));
