import {
  applySnapshot,
  clone,
  destroy,
  flow,
  getRoot,
  getSnapshot,
  types
} from "mobx-state-tree";
import { History } from "../../utils/history";
import { guidGenerator } from "../../utils/random";
import { isDefined, unique } from "../../utils/utils";
import { CustomJSON } from "../types";
import { Tab } from "./tab";
import { TabColumn } from "./tab_column";
import { TabFilterType } from "./tab_filter_type";
import { TabHiddenColumns } from "./tab_hidden_columns";

const storeValue = (name, value) => {
  window.localStorage.setItem(name, value);
  return value;
};

const restoreValue = (name) => {
  const value = window.localStorage.getItem(name);

  return value ? (value === "true" ? true : false) : false;
};

const dataCleanup = (tab, columnIds) => {
  const { data } = tab;

  if (data.filters) {
    data.filters.items = data.filters.items.filter(({ filter }) => {
      return columnIds.includes(filter.replace(/^filter:/, ''));
    });
  }

  ['columnsDisplayType', 'columnWidths'].forEach(key => {
    data[key] = Object.fromEntries(Object.entries(data[key] ?? {}).filter(([col]) => {
      return columnIds.includes(col);
    }));
  });

  Object.entries(data.hiddenColumns ?? {}).forEach(([key, list]) => {
    data.hiddenColumns[key] = list.filter(k => columnIds.includes(k));
  });

  return { ...tab, data };
};

const createNameCopy = (name) => {
  let newName = name;
  const matcher = /Copy(\s\(([\d]+)\))?/;
  const copyNum = newName.match(matcher);

  if (copyNum) {
    newName = newName.replace(matcher, (...match) => {
      const num = match[2];

      if (num) return `Copy (${Number(num) + 1})`;

      return 'Copy (2)';
    });
  } else {
    newName += ' Copy';
  }

  return newName;
};

export const TabStore = types
  .model("TabStore", {
    selected: types.maybeNull(types.late(() => types.reference(Tab))),
    views: types.optional(types.array(Tab), []),
    availableFilters: types.optional(types.array(TabFilterType), []),
    columnsTargetMap: types.map(types.array(TabColumn)),
    columnsRaw: types.optional(CustomJSON, []),
    sidebarVisible: restoreValue("sidebarVisible"),
    sidebarEnabled: restoreValue("sidebarEnabled"),
  })
  .volatile(() => ({
    defaultHidden: types.optional(TabHiddenColumns, {}),
  }))
  .views((self) => ({
    get all() {
      return self.views;
    },

    get canClose() {
      return self.all.length > 1;
    },

    get columns() {
      return self.columnsTargetMap.get(self.selected?.target ?? "tasks");
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

    get lastView() {
      return self.views[self.views.length - 1];
    },

    serialize() {
      return self.views.map((v) => v.serialize());
    },
  }))
  .actions((self) => ({
    setSelected: flow(function* (view, options = {}) {
      let selected;

      if (typeof view === "string") {
        selected = self.views.find((v) => v.key === view);
      } else if (typeof view === "number") {
        selected = self.views.find((v) => v.id === view);
      } else {
        selected = self.views.find((v) => v.id === view.id);
      }

      if (selected && self.selected !== selected) {
        if (options.pushState !== false) {
          History.navigate({ tab: selected.id }, true);
        }

        self.dataStore.clear();
        self.selected = selected;

        yield selected.reload();

        const root = getRoot(self);

        root.SDK.invoke('tabChanged', selected);
        selected.selected._invokeChangeEvent();
      }
    }),

    deleteView: flow(function* (view, { autoselect = true } = {}) {
      if (autoselect && self.selected === view) {
        let newView;

        if (self.selected.opener) {
          newView = self.opener.referrer;
        } else {
          const index = self.views.indexOf(view);

          newView = index === 0 ? self.views[index + 1] : self.views[index - 1];
        }

        self.setSelected(newView.key);
      }

      if (view.saved) {
        yield getRoot(self).apiCall("deleteTab", { tabID: view.id });
      }

      destroy(view);
    }),

    addView: flow(function* (viewSnapshot = {}, options) {
      const {
        autoselect = true,
        autosave = true,
        reload = true,
      } = options ?? {};

      const snapshot = viewSnapshot ?? {};
      const lastView = self.views[self.views.length - 1];
      const newTitle = `New Tab ${self.views.length + 1}`;
      const newID = viewSnapshot.id ?? (lastView?.id ? lastView.id + 1 : 0);
      const newSnapshot = {
        ...viewSnapshot,
        id: newID,
        title: newTitle,
        key: guidGenerator(),
        hiddenColumns: snapshot.hiddenColumns ?? clone(self.defaultHidden),
      };

      self.views.push(newSnapshot);
      let newView = self.views[self.views.length - 1];

      if (autosave) {
        yield newView.save({ reload });
      }

      if (autoselect) {
        const selectedView = self.views[self.views.length - 1];

        console.log('selecting and reloading', selectedView.id);
        self.setSelected(selectedView);
        selectedView.reload();
      }

      return newView;
    }),

    saveView: flow(function* (view, { reload, interaction } = {}) {
      const needsLock = ["ordering", "filter"].includes(interaction);

      if (needsLock) view.lock();
      const { id: tabID } = view;
      const body = { body: view.snapshot };
      const params = { tabID };

      if (interaction !== undefined) Object.assign(params, { interaction });

      const root = getRoot(self);
      const apiMethod =
        !view.saved && root.apiVersion === 2 ? "createTab" : "updateTab";

      const result = yield root.apiCall(apiMethod, params, body);
      const viewSnapshot = getSnapshot(view);
      const newViewSnapshot = {
        ...viewSnapshot,
        ...result,
        saved: true,
        filters: viewSnapshot.filters,
        conjunction: viewSnapshot.conjunction,
      };

      if (result.id !== view.id) {
        self.views.push({ ...newViewSnapshot, saved: true });
        const newView = self.views[self.views.length - 1];

        newView.reload();
        self.setSelected(newView);
        destroy(view);

        return newView;
      } else {
        console.log('saved');
        applySnapshot(view, newViewSnapshot);

        if (reload !== false) {
          view.reload({ interaction });
        }

        view.unlock();
        return view;
      }
    }),

    duplicateView: flow(function * (view) {
      const sn = getSnapshot(view);

      self.views.push({
        ...sn,
        id: Number.MAX_SAFE_INTEGER,
        saved: false,
        key: guidGenerator(),
        title: createNameCopy(sn.title),
      });

      const newView = self.views[self.views.length - 1];

      yield newView.save();
      self.selected = self.views[self.views.length - 1];
      self.selected.reload();
    }),

    createView(viewSnapshot) {
      return Tab.create(viewSnapshot ?? {});
    },

    expandFilters() {
      self.sidebarEnabled = storeValue("sidebarEnabled", true);
      self.sidebarVisible = storeValue("sidebarVisible", true);
    },

    collapseFilters() {
      self.sidebarEnabled = storeValue("sidebarEnabled", false);
      self.sidebarVisible = storeValue("sidebarVisible", false);
    },

    toggleSidebar() {
      self.sidebarVisible = storeValue("sidebarVisible", !self.sidebarVisible);
    },

    fetchColumns() {
      const columns = self.columnsRaw;
      const targets = unique(columns.map((c) => c.target));
      const hiddenColumns = {};
      const addedColumns = new Set();

      const createColumnPath = (columns, column) => {
        const result = [];

        if (column.parent) {
          result.push(
            createColumnPath(
              columns,
              columns.find((c) => {
                return !c.parent && c.id === column.parent && c.target === column.target;
              }),
            ).columnPath,
          );
        }

        const parentPath = result.join(".");

        result.push(column.id);

        const columnPath = result.join(".");

        return { parentPath, columnPath };
      };

      targets.forEach((target) => {
        self.columnsTargetMap.set(target, []);
      });

      columns.forEach((col) => {
        const { target, visibility_defaults: visibility } = col;

        const { columnPath, parentPath } = createColumnPath(columns, col);

        const columnID = `${target}:${columnPath}`;

        if (addedColumns.has(columnID)) return;

        const parent = parentPath ? `${target}:${parentPath}` : undefined;

        const children = col.children
          ? col.children.map((ch) => `${target}:${columnPath}.${ch}`)
          : undefined;

        const colsList = self.columnsTargetMap.get(col.target);

        colsList.push({
          ...col,
          id: columnID,
          alias: col.id,
          parent,
          children,
        });

        const column = colsList[colsList.length - 1];

        addedColumns.add(column.id);

        if (!col.children && column.filterable) {
          self.availableFilters.push({
            id: `filter:${columnID}`,
            type: col.type,
            field: columnID,
            schema: col.schema ?? null,
          });
        }

        Object.entries(visibility ?? {}).forEach(([key, visible]) => {
          if (!visible) {
            hiddenColumns[key] = hiddenColumns[key] ?? [];
            hiddenColumns[key].push(column.id);
          }
        });
      });

      self.defaultHidden = TabHiddenColumns.create(hiddenColumns);
    },

    fetchTabs: flow(function* (tabID, taskID, labeling) {
      const response = yield getRoot(self).apiCall("tabs");
      const tabs = response.tabs ?? response ?? [];
      const columnIds = self.columns.map(c => c.id);

      const snapshots = tabs.map((t) => {
        const { data, ...tab } = dataCleanup(t, columnIds);

        return {
          ...tab,
          ...(data ?? {}),
          saved: true,
          hasData: !!data,
        };
      });

      self.views.push(...snapshots);

      let defaultView = self.views[0];

      if (self.views.length === 0) {
        tabID = null;

        self.views.push({
          id: 0,
          title: "Default",
          hiddenColumns: self.defaultHidden,
        });

        defaultView = self.views[self.views.length - 1];

        yield defaultView.save(defaultView);

        // at this point newly created tab does not exist
        // so we need to take in from the list once again
        defaultView = self.views[self.views.length - 1];
        self.selected = defaultView;
        defaultView.reload();
      }

      const selected = tabID
        ? self.views.find((view) => {
          return view.id === parseInt(tabID);
        })
        : null;

      yield self.setSelected(selected ?? defaultView, {
        pushState: tabID === undefined,
      });

      yield self.selected.save();

      if (labeling) {
        getRoot(self).startLabelStream({
          pushState: false,
        });
      } else if (isDefined(taskID)) {
        const task = { id: parseInt(taskID) };

        getRoot(self).startLabeling(task, {
          pushState: false,
        });
      }
    }),

    fetchSingleTab: flow(function * (tabId, selectedItems) {
      const tabData = yield getRoot(self).apiCall("tab", { tabId });
      const columnIds = self.columns.map(c => c.id);
      const { data, ...tabClean } = dataCleanup(tabData, columnIds);

      self.views.push({
        ...tabClean,
        ...(data ?? {}),
        selected: {
          all: selectedItems?.all,
          list: selectedItems.included ?? selectedItems.excluded ?? [],
        },
        saved: true,
        hasData: !!data,
      });

      const tab = self.views[self.views.length - 1];

      self.selected = tab;
    }),
  }));
