import {
  clone,
  destroy,
  flow,
  getRoot,
  getSnapshot,
  types,
} from "mobx-state-tree";
import { guidGenerator } from "../../utils/random";
import { unique } from "../../utils/utils";
import { CustomJSON } from "../types";
import { View } from "./view";
import { ViewColumn } from "./view_column";
import { ViewFilterType } from "./view_filter_type";
import { ViewHiddenColumns } from "./view_hidden_columns";

const storeValue = (name, value) => {
  window.localStorage.setItem(name, value);
  return value;
};

const restoreValue = (name) => {
  const value = window.localStorage.getItem(name);

  return value ? (value === "true" ? true : false) : false;
};

export const ViewsStore = types
  .model("ViewsStore", {
    selected: types.maybeNull(types.reference(View)),
    views: types.optional(types.array(View), []),
    availableFilters: types.optional(types.array(ViewFilterType), []),
    columnsTargetMap: types.map(types.array(ViewColumn)),
    columnsRaw: types.optional(CustomJSON, []),
    sidebarVisible: restoreValue("sidebarVisible"),
    sidebarEnabled: restoreValue("sidebarEnabled"),
  })
  .volatile(() => ({
    defaultHidden: types.optional(ViewHiddenColumns, {}),
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
    setSelected(view) {
      let selected;
      if (typeof view === "string") {
        selected = self.views.find((v) => v.key === view);
      } else if (typeof view === "number") {
        selected = self.views.find((v) => v.id === view);
      } else {
        selected = self.views.find((v) => v.id === view.id);
      }

      if (self.selected !== selected) {
        self.dataStore.clear();
        self.selected = selected;
        self.selected.reload();
        localStorage.setItem("selectedTab", self.selected.id);
      }
    },

    deleteView: flow(function* (view) {
      if (self.selected === view) {
        let newView;

        if (self.selected.opener) {
          newView = self.opener.referrer;
        } else {
          const index = self.views.indexOf(view);
          newView = index === 0 ? self.views[index + 1] : self.views[index - 1];
        }
        self.setSelected(newView.key);
      }

      yield view.delete();
      destroy(view);
    }),

    addView: flow(function* (viewSnapshot) {
      const snapshot = viewSnapshot ?? {};
      const lastView = self.views[self.views.length - 1];
      const newTitle = `New Tab ${self.views.length + 1}`;
      const newID = snapshot.id ?? (lastView?.id ? lastView.id + 1 : 0);

      const newView = self.createView({
        ...snapshot,
        id: newID,
        title: newTitle,
        key: guidGenerator(),
        hiddenColumns: snapshot.hiddenColumns ?? clone(self.defaultHidden),
      });

      self.views.push(newView);

      yield newView.save();
      self.setSelected(newView);

      return newView;
    }),

    duplicateView(view) {
      const sn = getSnapshot(view);
      self.addView({
        ...sn,
        id: self.lastView.id + 1,
        saved: false,
      });
    },

    createView(viewSnapshot) {
      return View.create(viewSnapshot ?? {});
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

      const createColumnPath = (columns, column) => {
        const result = [];

        if (column.parent) {
          result.push(
            createColumnPath(
              columns,
              columns.find((c) => {
                return c.id === column.parent && c.target === column.target;
              })
            ).columnPath
          );
        }

        const parentPath = result.join(".");

        result.push(column.id);

        const columnPath = result.join(".");

        return { parentPath, columnPath };
      };

      targets.forEach((t) => {
        self.columnsTargetMap.set(t, []);
      });

      columns.forEach((c) => {
        const { target, visibility_defaults: visibility } = c;

        const { columnPath, parentPath } = createColumnPath(columns, c);

        const columnID = `${target}:${columnPath}`;
        const parent = parentPath ? `${target}:${parentPath}` : undefined;

        const children = c.children
          ? c.children.map((ch) => `${target}:${columnPath}.${ch}`)
          : undefined;

        const column = ViewColumn.create({
          ...c,
          id: columnID,
          alias: c.id,
          parent,
          children,
        });

        self.columnsTargetMap.get(c.target).push(column);

        if (!c.children) {
          self.availableFilters.push({
            id: `filter:${columnID}`,
            type: c.type,
            field: columnID,
            schema: c.schema ?? null,
          });
        }

        Object.entries(visibility ?? {}).forEach(([key, visible]) => {
          if (!visible) {
            hiddenColumns[key] = hiddenColumns[key] ?? [];
            hiddenColumns[key].push(column.id);
          }
        });
      });

      self.defaultHidden = ViewHiddenColumns.create(hiddenColumns);
    },

    fetchViews: flow(function* () {
      const { tabs } = yield getRoot(self).apiCall("tabs");

      const snapshots = tabs.map((t) => View.create({ ...t, saved: true }));

      self.views.push(...snapshots);

      const selected = localStorage.getItem("selectedTab");
      const selectedView = self.views.find((v) => v.id === Number(selected));
      self.setSelected(selectedView ?? self.views[0]);
    }),
  }));
