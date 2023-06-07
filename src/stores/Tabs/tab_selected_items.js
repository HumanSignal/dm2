import { getRoot, types } from "mobx-state-tree";
import { DynamicModel } from "../DynamicModel";

export const TabSelectedItems = types
  .model("TabSelectedItems", {
    all: false,
    list: types.optional(types.array(types.number), []),
    listObject: types.optional(
      types.array(
        types.late(() => DynamicModel.get("TaskModel")),
      )
      , []),
  })
  .views((self) => ({
    get snapshot() {
      return {
        all: self.all,
        [self.listName]: Array.from(self.list),
        listObject: Array.from(self.listObject),
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
        const totalCount = getRoot(self).dataStore.total ?? 0;

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
    afterCreate() {
      self._invokeChangeEvent();
    },

    toggleSelectedAll() {
      if (!self.all || !(self.all && self.isIndeterminate)) {
        self.all = !self.all;
      }

      self.list = [];
      self.listObject = [];
      self._invokeChangeEvent();
    },

    addItem(id) {
      const item = getRoot(self).taskStore.list.find(rec => rec.id === id);

      self.list.push(id);
      self.listObject = [...self.listObject, item.toJSON()];
      self._invokeChangeEvent();
    },

    removeItem(id) {
      self.list.splice(self.list.indexOf(id), 1);
      self.listObject = self.listObject.filter(rec => rec.id !== id);
      self._invokeChangeEvent();
    },

    toggleItem(id) {
      const item = getRoot(self).taskStore.list.find(rec => rec.id === id);

      if (self.list.includes(id)) {
        self.list.splice(self.list.indexOf(id), 1);
        self.listObject = self.listObject.filter(rec => rec.id !== id);
      } else {
        self.list.push(id);
        self.listObject = [...self.listObject, item.toJSON()];
      }
      self._invokeChangeEvent();
    },

    update(data) {
      const taskStoreList = getRoot(self).taskStore.list;

      self.all = data?.all ?? self.all;
      self.list = data?.[self.listName] ?? self.list;
      self.listObject = data?.[self.listName] ? data?.[self.listName]?.map(id => taskStoreList.find(rec => rec.id === id)) : self.listObject;
      self._invokeChangeEvent();
    },

    clear() {
      self.all = false;
      self.list = [];
      self.listObject = [];
      self._invokeChangeEvent();
    },

    _invokeChangeEvent() {
      getRoot(self).SDK.invoke('taskSelectionChanged', self);
    },
  }))
  .preProcessSnapshot((sn) => {
    const { included, excluded, all, listObject } = sn ?? {};
    const result = { all, list: sn.list ?? (all ? excluded : included), listObject };

    return result;
  });
