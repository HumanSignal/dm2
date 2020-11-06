import { getParent, getRoot, types } from "mobx-state-tree";
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
    afterAttach() {
      const { tableConfig } = getRoot(self).SDK;
      const { columns } = getParent(self).parent;

      ["explore", "labeling"].forEach((mode) => {
        if (self[mode].length !== 0) return;

        const hidden = tableConfig.hiddenColumns?.[mode] ?? [];
        const visible = tableConfig.visibleColumns?.[mode] ?? [];
        let result = [];

        if (hidden.length) {
          result = columns.filter((c) => hidden.includes(c.id));
        } else {
          result = columns.filter((c) => !visible.includes(c.id));
        }

        self[mode].push(...result);
      });
    },

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
