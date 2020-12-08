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

const SelectedItems = types
  .model("SelectedItems", {
    all: types.optional(types.boolean, false),
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

    isAllSelected() {
      return self.all && self.list.length === 0;
    },

    isIndeterminate() {
      return self.list.length > 0;
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
      self.all = !self.all;
      self.list = [];
    },

    addItem(id) {
      self.list.push(id);
    },

    removeItem(id) {
      self.list.splice(self.list.indexOf(id), 1);
    },

    toggleItem(id) {
      if (self.list.includes(id)) {
        self.list.splice(self.list.indexOf(id), 1);
      } else {
        self.list.push(id);
      }
    },

    update(data) {
      self.all = data?.all ?? self.all;
      self.list = data?.[self.listName] ?? self.list;
    },
  }));

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
    selected: types.optional(SelectedItems, {}),
    selecting: types.optional(types.boolean, false),
    opener: types.optional(types.maybeNull(types.late(() => View)), null),

    enableFilters: false,
    renameMode: false,
    saved: false,
    virtual: false,
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
        filters: {
          conjunction: self.conjunction,
          items: self.serializedFilters,
        },
        hiddenColumns: getSnapshot(self.hiddenColumns),
      };
    },

    async labelAll() {
      self.root.SDK.setMode("labelstream");
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
      self.parent.setTask(params);
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

    selectAll() {
      self.selected.toggleSelectedAll();
      self.updateSelectedList("setSelectedItems");
    },

    toggleSelected(id) {
      const isSelected = self.selected.isSelected(id);
      const action = isSelected ? "deleteSelectedItem" : "addSelectedItem";

      self.selected.toggleItem(id);

      self.updateSelectedList(action, {
        [self.selected.listName]: [id],
      });
    },

    updateSelectedList: flow(function* (action, extraData) {
      const { selectedItems } = yield getRoot(self).apiCall(
        action,
        { tabID: self.id },
        { body: { ...self.selected.snapshot, ...(extraData ?? {}) } }
      );

      self.selected.update(selectedItems);
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

    invokeAction: flow(function* (actionId, options = {}) {
      const actionParams = {
        ordering: self.ordering,
        selectedItems: self.selected.snapshot,
        filters: {
          conjunction: self.conjunction,
          items: self.serializedFilters,
        },
      };

      const result = yield getRoot(self).apiCall(
        "invokeAction",
        {
          id: actionId,
          tabID: self.id,
        },
        {
          body: actionParams,
        }
      );

      if (options.reload !== false) {
        self.reload();
        self.setSelected([]);
      }

      return result;
    }),

    save: flow(function* ({ reload } = {}) {
      if (self.virtual) return;

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
