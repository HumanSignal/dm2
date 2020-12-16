import { applySnapshot, getParent, types } from "mobx-state-tree";
import { guidGenerator } from "../../utils/random";

export const InfiniteListItem = types
  .model("InfiniteListItem", {
    updated: guidGenerator(),
    loading: false,
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

    get isLoading() {
      return self.parent.itemIsLoading(self.id) || self.parent.isLoading;
    },
  }))
  .actions((self) => ({
    update(newData) {
      applySnapshot(self, { ...newData, updated: guidGenerator() });
      return self;
    },

    setLoading(loading) {
      self.loading = loading;
    },
  }));
