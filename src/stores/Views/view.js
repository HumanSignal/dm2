import {
  destroy,
  flow,
  getParent,
  getRoot,
  getSnapshot,
  types,
} from "mobx-state-tree";
import { guidGenerator } from "../../utils/random";
import { ViewFilter } from "./view_filter";
import { ViewHiddenColumns } from "./view_hidden_columns";

export const View = types
  .model("View", {
    id: types.identifierNumber,

    title: "Tasks",
    oldTitle: types.maybeNull(types.string),

    key: types.optional(types.string, guidGenerator),

    type: types.optional(types.enumeration(["list", "grid"]), "list"),

    target: types.optional(
      types.enumeration(["tasks", "annotations"]),
      "tasks"
    ),

    filters: types.array(types.late(() => ViewFilter)),
    conjunction: types.optional(types.enumeration(["and", "or"]), "and"),
    hiddenColumns: types.maybeNull(types.optional(ViewHiddenColumns, {})),
    ordering: types.optional(types.array(types.string), []),
    selected: types.optional(types.array(types.number), []),
    selecting: types.optional(types.boolean, false),

    enableFilters: false,
    renameMode: false,
    saved: false,
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
      return self.columns.filter((c) => c.target === self.target);
    },

    // get fields formatted as columns structure for react-table
    get fieldsAsColumns() {
      return self.columns.reduce((res, column) => {
        if (!column.parent) {
          res.push(...column.asField);
        }
        return res;
      }, []);
    },

    get hiddenColumnsList() {
      return self.columns.filter((c) => c.hidden).map((c) => c.key);
    },

    get availableFilters() {
      return self.parent.availableFilters;
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
        const fieldName = field.replace(/^-/, "");
        const desc = field[0] === "-";

        return { ...res, [fieldName]: desc };
      }, {});
    },

    get filtersApplied() {
      return self.validFilters.length > 0;
    },

    get validFilters() {
      return self.filters.filter((f) => !!f.isValidFilter);
    },

    get serializedFilters() {
      return self.validFilters.map((el) => getSnapshot(el));
    },

    serialize() {
      return {
        id: self.id,
        title: self.title,
        ordering: self.ordering,
        type: self.type,
        target: self.target,
        filters: self.serializedFilters,
        hiddenColumns: getSnapshot(self.hiddenColumns),
        conjunction: self.conjunction,
      };
    },
  }))
  .actions((self) => ({
    setType(type) {
      self.type = type;
      self.save();
    },

    setTarget(target) {
      self.target = target;
      self.save();
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

    setFilters(filters) {
      self.filters.push(...(filters ?? []));
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

    setSelected(ids) {
      self.selected = ids;
      self.updateSelectedList("setSelectedItems", Array.from(self.selected));
    },

    selectAll: flow(function* () {
      self.selecting = true;
      yield self.updateSelectedList("setSelectedItems", "all");
      self.selecting = false;
    }),

    markSelected(id) {
      self.selected.push(id);
      self.updateSelectedList("addSelectedItem", [id]);
    },

    unmarkSelected(id) {
      const index = self.selected.findIndex((storedID) => id === storedID);
      self.selected.splice(index, 1);
      self.updateSelectedList("deleteSelectedItem", [id]);
    },

    updateSelectedList: flow(function* (action, body) {
      const { selectedItems } = yield getRoot(self).apiCall(
        action,
        { tabID: self.id },
        { body }
      );

      self.selected = selectedItems ?? self.selected;
    }),

    createFilter() {
      const filterType = self.availableFilters[0];
      const filter = ViewFilter.create({
        filter: filterType,
        view: self.id,
      });

      self.filters.push(filter);

      if (filter.isValidFilter) self.save();
    },

    toggleColumn(column) {
      if (self.hiddenColumns.hasColumn(column)) {
        self.hiddenColumns.remove(column);
      } else {
        self.hiddenColumns.add(column);
      }
      self.save({ reload: false });
    },

    reload() {
      if (self.saved) {
        getRoot(self).unsetSelection();
        self.dataStore.reload();
      }
    },

    deleteFilter(filter) {
      const index = self.filters.findIndex((f) => f === filter);
      self.filters.splice(index, 1);
      destroy(filter);
      self.save();
    },

    afterAttach() {
      if (self.saved) {
        self.hiddenColumns = self.hiddenColumns ?? ViewHiddenColumns.create();
      }
    },

    invokeAction: flow(function* (actionId) {
      yield getRoot(self).apiCall(
        "invokeAction",
        {
          id: actionId,
          tabID: self.id,
        },
        {
          body: {
            filters: self.serializedFilters,
            selectedItems: Array.from(self.selected),
          },
        }
      );

      self.reload();
      self.setSelected([]);
    }),

    save: flow(function* ({ reload } = {}) {
      const { id: tabID } = self;
      const body = self.serialize();

      yield getRoot(self).apiCall("updateTab", { tabID }, { body });

      self.saved = true;
      if (reload !== false) self.reload();
    }),

    delete: flow(function* () {
      yield getRoot(self).apiCall("deleteTab", { tabID: self.id });
    }),
  }));
