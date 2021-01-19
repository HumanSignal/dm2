import { getRoot, types } from "mobx-state-tree";
import { ViewColumn } from "./view_column";

const ColumnsList = types.maybeNull(
  types.array(types.late(() => types.reference(ViewColumn)))
);

export const ViewHiddenColumns = types
  .model("HiddenColumns", {
    explore: types.optional(ColumnsList, []),
    labeling: types.optional(ColumnsList, []),
  })
  .views((self) => ({
    get length() {
      return self.explore.length + self.labeling.length;
    },

    get activeList() {
      return getRoot(self).isLabeling ? self.labeling : self.explore;
    },

    set activeList(list) {
      if (getRoot(self).isLabeling) {
        self.labeling = list;
      } else {
        self.explore = list;
      }
      return self.activeList;
    },

    hasColumn(column) {
      return self.activeList.indexOf(column) >= 0;
    },
  }))
  .actions((self) => ({
    add(column) {
      const set = new Set(self.activeList);
      set.add(column);
      self.activeList = Array.from(set);
    },

    remove(column) {
      const set = new Set(self.activeList);
      set.delete(column);
      self.activeList = Array.from(set);
    },
  }));
