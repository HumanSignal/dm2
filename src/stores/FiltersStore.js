import { types } from "mobx-state-tree";

const StringFilter = types
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

const NumberFilter = types
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

const RangeNumberFilter = types
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

export { StringFilter, NumberFilter, RangeNumberFilter };
