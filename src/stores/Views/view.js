import { getParent, getRoot, types } from "mobx-state-tree";
import { guidGenerator } from "../../utils/random";
import { ViewColumn } from "./view_column";
import { ViewFilter } from "./view_filter";

export const View = types
  .model("View", {
    id: types.identifierNumber,

    title: "Tasks",

    key: types.optional(types.string, guidGenerator),

    type: types.optional(types.enumeration(["list", "grid"]), "list"),

    target: types.optional(
      types.enumeration(["tasks", "annotations"]),
      "tasks"
    ),

    filters: types.optional(types.array(ViewFilter), []),

    hiddenColumns: types.maybeNull(
      types.array(types.late(() => types.reference(ViewColumn)))
    ),

    enableFilters: false,
    renameMode: false,
  })
  .views((self) => ({
    get root() {
      return getRoot(self);
    },

    get parent() {
      return getParent(getParent(self));
    },

    get dataFields() {
      return self.fields
        .filter((f) => f.source === "inputs")
        .map((f) => f.field);
    },

    get hasDataFields() {
      return self.dataFields.length > 0;
    },

    get columns() {
      return getRoot(self).viewsStore.columns;
    },

    get visibleColumns() {
      return self.columns.filter((c) => !c.hidden);
    },

    get columnsVisibility() {
      return self.columns.reduce((res, col) => {
        return [...res, [col.key, !col.isHidden]];
      }, []);
    },

    // get fields formatted as columns structure for react-table
    get fieldsAsColumns() {
      return self.visibleColumns.reduce((res, column) => {
        if (!column.parent) {
          res.push(column.asField);
        }
        return res;
      }, []);
    },

    fieldsSource(source) {
      return self.fields.filter((f) => f.source === source);
    },
  }))
  .actions((self) => ({
    setType(type) {
      self.type = type;
    },

    setTarget(target) {
      self.target = target;
    },

    setTitle(title) {
      self.title = title;
    },

    setRenameMode(mode) {
      self.renameMode = mode;
    },

    toggleFilters() {
      self.enableFilters = !self.enableFilters;
    },

    toggleColumn(column) {
      if (self.hiddenColumns.includes(column)) {
        self.hiddenColumns = self.hiddenColumns.filter((c) => c !== column);
      } else {
        self.hiddenColumns = [...self.hiddenColumns, column];
      }
    },
  }));
