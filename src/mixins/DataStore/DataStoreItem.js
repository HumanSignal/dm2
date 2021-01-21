import { applySnapshot, getParent, getSnapshot, types } from "mobx-state-tree";
import { guidGenerator } from "../../utils/random";

export const DataStoreItem = types
  .model("DataStoreItem", {
    updated: guidGenerator(),
    loading: false,
  })
  .views((self) => ({
    get parent() {
      return getParent(getParent(self));
    },

    get isSelected() {
      return self.parent?.selected === self;
    },

    get isHighlighted() {
      return self.parent?.highlighted === self;
    },

    get isLoading() {
      return self.parent.itemIsLoading(self.id);
    },
  }))
  .actions((self) => ({
    update(newData) {
      applySnapshot(self, {
        ...getSnapshot(self),
        ...newData,
        updated: guidGenerator(),
      });
      return self;
    },

    setLoading(loading) {
      self.loading = loading;
    },

    markUpdated() {
      self.updated = guidGenerator();
    },
  }));
