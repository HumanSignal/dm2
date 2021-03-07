import { getRoot, types } from "mobx-state-tree";

export const TabSelectedItems = types
  .model("TabSelectedItems", {
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

    get total() {
      if (self.all) {
        const totalCount = getRoot(self).project.task_count;
        return totalCount - self.length;
      } else {
        return self.length;
      }
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
      getRoot(self).SDK.invoke('taskSelectionChanged', [self]);
    },

    addItem(id) {
      self.list.push(id);
      getRoot(self).SDK.invoke('taskSelectionChanged', [self]);
    },

    removeItem(id) {
      self.list.splice(self.list.indexOf(id), 1);
      getRoot(self).SDK.invoke('taskSelectionChanged', [self]);
    },

    toggleItem(id) {
      if (self.list.includes(id)) {
        self.list.splice(self.list.indexOf(id), 1);
      } else {
        self.list.push(id);
      }
      getRoot(self).SDK.invoke('taskSelectionChanged', [self]);
    },

    update(data) {
      self.all = data?.all ?? self.all;
      self.list = data?.[self.listName] ?? self.list;
      getRoot(self).SDK.invoke('taskSelectionChanged', [self]);
    },

    clear() {
      self.all = false;
      self.list = [];
      getRoot(self).SDK.invoke('taskSelectionChanged', [self]);
    },
  }))
  .preProcessSnapshot((sn) => {
    const { included, excluded, all } = sn ?? {};
    const result = { all, list: sn.list ?? (all ? excluded : included) };
    return result;
  });
