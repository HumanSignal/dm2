import { types } from "mobx-state-tree";

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
    return typeof value === "object" || typeof value === "string";
  },
  getValidationMessage() {
    return "Error parsing JSON";
  },
});

export const StringOrNumber = types.union(types.string, types.number);

export const StringOrNumberID = types.union(types.identifier, types.identifierNumber);

export const CustomCalback = types.custom({
  name: "callback",
  toSnapshot(value) {
    return value;
  },
  fromSnapshot(value) {
    return value;
  },
  isTargetType(value) {
    return typeof value === "function";
  },
  getValidationMessage() {
    return "is not a function";
  },
});