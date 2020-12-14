import { types } from "mobx-state-tree";

export const SelectedItems = types
  .model("SelectedItems", {
    all: false,
    list: types.optional(types.array(types.number), []),
  })
  .views((self) => ({
    get snapshot() {
      return {
        all: self.all,
        [self.listName]: Array.from(self.list),
      };
    },

    get listName() {
      return self.all ? "excluded" : "included";
    },

    get hasSelected() {
      return self.isAllSelected || self.isIndeterminate;
    },

    get isAllSelected() {
      return self.all && self.list.length === 0;
    },

    get isIndeterminate() {
      return self.list.length > 0;
    },

    get length() {
      return self.list.length;
    },

    isSelected(id) {
      if (self.all) {
        return !self.list.includes(id);
      } else {
        return self.list.includes(id);
      }
    },
  }))
  .actions((self) => ({
    toggleSelectedAll() {
      if (!self.all || !(self.all && self.isIndeterminate)) {
        self.all = !self.all;
      }

      self.list = [];
    },

    addItem(id) {
      self.list.push(id);
    },

    removeItem(id) {
      self.list.splice(self.list.indexOf(id), 1);
    },

    toggleItem(id) {
      if (self.list.includes(id)) {
        self.list.splice(self.list.indexOf(id), 1);
      } else {
        self.list.push(id);
      }
    },

    update(data) {
      self.all = data?.all ?? self.all;
      self.list = data?.[self.listName] ?? self.list;
    },

    clear() {
      self.all = false;
      self.list = [];
    },
  }));
