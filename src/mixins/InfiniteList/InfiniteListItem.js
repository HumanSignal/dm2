import { getParent, types } from "mobx-state-tree";

export const InfiniteListItem = types
  .model("InfiniteListItem", {})
  .views((self) => ({
    get parent() {
      return getParent(getParent(self));
    },
    get isSelected() {
      return self.parent.selected === self;
    },

    get isHighlighted() {
      return self.parent.highlighted === self;
    },
  }))
  .actions((self) => ({
    update(newData) {
      for (let key in newData) self[key] = newData[key];
      return self;
    },
  }));
