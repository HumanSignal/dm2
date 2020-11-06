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
      ]),
      "String"
    ),
    defaultHidden: types.optional(types.boolean, false),
    parent: types.maybeNull(types.late(() => types.reference(ViewColumn))),
    children: types.maybeNull(
      types.array(types.late(() => types.reference(ViewColumn)))
    ),
    target: types.enumeration(["tasks", "annotations"]),
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
      if (self.parent) {
        return `${self.parent.key}.${self.id}`;
      } else {
        return self.id;
      }
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

    get asField() {
      const result = {
        ...self,
        id: self.key,
        Header: self.title,
        Cell: self.renderer,
        accessor: self.accessor,
        hidden: self.hidden,
      };

      if (self.children) {
        result.columns = self.children.map((subColumn) => subColumn.asField);
      }

      return result;
    },
  }))
  .actions((self) => ({
    toggleVisibility() {
      self.parentView.toggleColumn(self);
    },
  }));
