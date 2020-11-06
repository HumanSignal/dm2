import { types } from "mobx-state-tree";

export const InfiniteListItem = types
  .model("InfiniteListItem", {})
  .actions((self) => ({
    update(newData) {
      for (let key in newData) self[key] = newData[key];
      return self;
    },
  }));
