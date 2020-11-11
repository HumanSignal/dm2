import {
  destroy,
  flow,
  getParent,
  getRoot,
  getSnapshot,
  types,
} from "mobx-state-tree";
import { guidGenerator } from "../../utils/random";
import { CustomJSON } from "../types";
import { ViewFilter } from "./view_filter";
import { ViewHiddenColumns } from "./view_hidden_columns";

export const View = types
  .model("View", {
    id: types.identifierNumber,

    title: "Tasks",
    oldTitle: types.maybeNull(types.string),

    key: types.optional(types.string, guidGenerator),

    type: types.optional(types.enumeration(["list", "grid"]), "grid"),

    target: types.optional(
      types.enumeration(["tasks", "annotations"]),
      "tasks"
    ),

    filters: types.array(types.late(() => ViewFilter)),
    conjunction: types.optional(types.enumeration(["and", "or"]), "and"),
    selectedTasks: types.optional(types.array(CustomJSON), []),
    selectedCompletions: types.optional(types.array(CustomJSON), []),
    hiddenColumns: types.maybeNull(types.optional(ViewHiddenColumns, {})),
    ordering: types.optional(types.array(types.string), []),

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

    get columns() {
      return getRoot(self).viewsStore.columns;
    },

    get targetColumns() {
      return self.columns.filter((c) => c.target == self.target);
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

    get availableFilters() {
      return self.parent.availableFilters.filter(
        (f) => f.field.target === self.target
      );
    },

    get dataStore() {
      return getRoot(self).dataStore;
    },

    get taskStore() {
      return getRoot(self).taskStore;
    },

    get annotationStore() {
      return getRoot(self).annotationStore;
    },

    get currentFilters() {
      return self.filters.filter((f) => f.target === self.target);
    },

    get currentOrder() {
      return self.ordering.reduce((res, field) => {
        const fieldName = field.replace(/^\-/, "");
        const desc = field[0] === "-";

        return { ...res, [fieldName]: desc };
      }, {});
    },

    serialize() {
      return {
        id: self.id,
        title: self.title,
        ordering: self.ordering,
        filters: getSnapshot(self.filters).filter((f) => !!f.value),
        hiddenColumns: getSnapshot(self.hiddenColumns),
        conjunction: self.conjunction,
      };
    },
  }))
  .actions((self) => ({
    setType(type) {
      self.type = type;
    },

    setTarget(target) {
      self.target = target;
      self.dataStore.reload();
    },

    setTitle(title) {
      self.title = title;
      self.save();
    },

    setRenameMode(mode) {
      self.renameMode = mode;
      if (self.renameMode) self.oldTitle = self.title;
    },

    setConjunction(value) {
      self.conjunction = value;
      self.save();
    },

    setTask(params = {}) {
      getRoot(self).viewsStore.setTask(params);
    },

    setOrdering(value) {
      const direction = self.currentOrder[value];
      let ordering = value;

      if (direction !== undefined) {
        ordering = direction ? value : `-${value}`;
      }

      self.ordering[0] = ordering;
      self.save();
    },

    createFilter() {
      const filter = self.availableFilters[0];
      self.filters.push({ filter, view: self.id });
    },

    toggleColumn(column) {
      if (self.hiddenColumns.hasColumn(column)) {
        self.hiddenColumns.remove(column);
      } else {
        self.hiddenColumns.add(column);
      }
      self.save();
    },

    reload() {
      self.dataStore.reload();
    },

    deleteFilter(filter) {
      const index = self.filters.findIndex((f) => f === filter);
      self.filters.splice(index, 1);
      destroy(filter);
      self.save();
    },

    afterAttach() {
      self.hiddenColumns = self.hiddenColumns ?? ViewHiddenColumns.create();
    },

    save: flow(function* () {
      const { id: tabID } = self;
      const body = self.serialize();

      yield getRoot(self).API.updateTab({ tabID }, { body });

      self.reload();
    }),

    delete: flow(function* () {
      yield getRoot(self).API.deleteTab();
    }),
  }));
