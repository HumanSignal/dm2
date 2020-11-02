import { getParent, getRoot, types } from "mobx-state-tree";
import { guidGenerator } from "../../utils/random";
import { TasksStore } from "../Tasks";
import { CustomJSON } from "../types";
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

    filters: types.array(types.late(() => ViewFilter)),
    selectedTasks: types.optional(types.array(CustomJSON), []),
    selectedCompletions: types.optional(types.array(CustomJSON), []),

    hiddenColumns: types.maybeNull(
      types.array(types.late(() => types.reference(ViewColumn)))
    ),

    enableFilters: false,
    renameMode: false,
    taskStore: types.optional(TasksStore, {}),
  })
  .views((self) => ({
    get root() {
      return getRoot(self);
    },

    get parent() {
      return getParent(getParent(self));
    },

    get columns() {
      return getRoot(self).viewsStore.columns;
    },

    // get fields formatted as columns structure for react-table
    get fieldsAsColumns() {
      return self.columns.reduce((res, column) => {
        if (!column.parent) {
          res.push(column.asField);
        }
        return res;
      }, []);
    },

    get hiddenColumnsList() {
      return self.columns.filter((c) => c.hidden).map((c) => c.key);
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

    createFilter() {
      self.filters.push({
        filter: self.parent.availableFilters[0],
      });
    },

    toggleColumn(column) {
      if (self.hiddenColumns.includes(column)) {
        self.hiddenColumns = self.hiddenColumns.filter((c) => c !== column);
      } else {
        self.hiddenColumns = [...self.hiddenColumns, column];
      }
    },

    reload() {
      self.taskStore.reload();
    },
  }));
