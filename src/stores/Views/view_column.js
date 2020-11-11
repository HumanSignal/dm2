import { getRoot, getSnapshot, types } from "mobx-state-tree";
import { all } from "../../utils/utils";

export const ViewColumn = types
  .model("ViewColumn", {
    id: types.identifier,
    title: types.string,
    alias: types.string,
    type: types.optional(
      types.enumeration([
        "String",
        "Number",
        "Boolean",
        "Datetime",
        "List",
        "Image",
        "Audio",
        "AudioPlus",
        "Text",
        "HyperText",
        "TimeSeries",
      ]),
      "String"
    ),
    defaultHidden: types.optional(types.boolean, false),
    parent: types.maybeNull(types.late(() => types.reference(ViewColumn))),
    children: types.maybeNull(
      types.array(types.late(() => types.reference(ViewColumn)))
    ),
    target: types.enumeration(["tasks", "annotations"]),
    width: types.optional(types.integer, 150),
    orderable: types.optional(types.boolean, true),
  })
  .views((self) => ({
    get hidden() {
      if (self.children) {
        return all(self.children, (c) => c.hidden);
      } else {
        return self.parentView?.hiddenColumns.hasColumn(self) ?? false;
      }
    },

    get parentView() {
      return getRoot(self).viewsStore.selected;
    },

    get key() {
      return self.id;
    },

    get accessor() {
      return (data) => {
        if (!self.parent) {
          const value = data[self.alias];
          return typeof value === "object" ? null : value;
        }

        try {
          const value = data?.[self.parent.alias]?.[self.alias];
          return value ?? null;
        } catch {
          console.log("Error generating accessor", {
            id: self.alias,
            parent: self.parent?.alias,
            data,
            snapshot: getSnapshot(self),
          });
          return data[self.alias];
        }
      };
    },

    get renderer() {
      return ({ value }) => {
        return value?.toString() ?? null;
      };
    },

    get canOrder() {
      return self.orderable && !self.children;
    },

    get order() {
      return self.parentView.currentOrder[self.id];
    },

    get asField() {
      const result = [];

      if (self.children) {
        const childColumns = [].concat(
          ...self.children.map((subColumn) => subColumn.asField)
        );
        result.push(...childColumns);
      } else {
        result.push({
          ...self,
          id: self.key,
          Header: self.title,
          Cell: self.renderer,
          accessor: self.accessor,
          hidden: self.hidden,
          original: self,
        });
      }

      return result;
    },
  }))
  .actions((self) => ({
    toggleVisibility() {
      self.parentView.toggleColumn(self);
    },
  }));
