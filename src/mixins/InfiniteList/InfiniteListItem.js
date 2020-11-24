import { getParent, types } from "mobx-state-tree";
import { guidGenerator } from "../../utils/random";

export const InfiniteListItem = types
  .model("InfiniteListItem", {
    updated: guidGenerator(),
  })
  .views((self) => ({
    get parent() {
      return getParent(getParent(self));
    },

    get isSelected() {
      return self.parent.selected === self;
    },

    get isHighlighted() {
      try {
        return self.parent.highlighted === self;
      } catch {
        return undefined;
      }
    },
  }))
  .actions((self) => ({
    update(newData) {
      for (let key in newData) self[key] = newData[key];
      self.updated = guidGenerator();
      return self;
    },
  }));
