const { types } = require("mobx-state-tree");

export const CustomJSON = types.custom({
  name: "JSON",
  toSnapshot(value) {
    return JSON.stringify(value);
  },
  fromSnapshot(value) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  },
  isTargetType(value) {
    return typeof value === "object";
  },
  getValidationMessage() {
    return "Error parsing JSON";
  },
});

export const StringOrNumber = types.union(types.string, types.number);
