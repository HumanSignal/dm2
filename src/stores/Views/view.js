import {
  destroy,
  flow,
  getParent,
  getRoot,
  getSnapshot,
  types,
} from "mobx-state-tree";
import { guidGenerator } from "../../utils/random";
import { TasksStore } from "../Tasks";
import { CustomJSON } from "../types";
import { ViewColumn } from "./view_column";
import { ViewFilter } from "./view_filter";

const ColumnsList = types.maybeNull(
  types.array(types.late(() => types.reference(ViewColumn)))
);

const HiddenColumns = types
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
    filtersConjunction: types.optional(types.enumeration(["and", "or"]), "and"),
    selectedTasks: types.optional(types.array(CustomJSON), []),
    selectedCompletions: types.optional(types.array(CustomJSON), []),

    // hiddenColumns: types.maybeNull(
    //   types.array(types.late(() => types.reference(ViewColumn)))
    // ),

    hiddenColumns: types.maybeNull(types.optional(HiddenColumns, {})),

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

    serialize() {
      return {
        id: self.id,
        title: self.title,
        filters: getSnapshot(self.filters),
        hiddenColumns: getSnapshot(self.hiddenColumns),
      };
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

    setConjunction(value) {
      self.filtersConjunction = value;
    },

    createFilter() {
      self.filters.push({
        filter: self.parent.availableFilters[0],
        view: self.id,
      });
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
      self.taskStore.reload();
    },

    deleteFilter(filter) {
      const index = self.filters.findIndex((f) => f === filter);
      self.filters.splice(index, 1);
      destroy(filter);
      self.save();
    },

    afterAttach() {
      self.hiddenColumns = HiddenColumns.create();
    },

    save: flow(function* () {
      const { id: tabID } = self;
      const body = self.serialize();

      yield getRoot(self).API.updateTab({ tabID }, { body });

      self.reload();
    }),
  }));
