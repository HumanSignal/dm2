import {
  destroy,
  flow,
  getParent,
  getRoot,
  getSnapshot,
  types,
} from "mobx-state-tree";
import { guidGenerator } from "../../utils/random";
import { unique } from "../../utils/utils";
import { View } from "./view";
import { ViewColumn } from "./view_column";
import { ViewFilterType } from "./view_filter_type";

export const ViewsStore = types
  .model("ViewsStore", {
    selected: types.safeReference(View),
    views: types.optional(types.array(View), []),
    availableFilters: types.optional(types.array(ViewFilterType), []),
    columnsTargetMap: types.map(types.array(ViewColumn)),
    sidebarEnabled: types.optional(types.boolean, false),
    sidebarVisible: types.optional(types.boolean, false),
  })
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

      self.selected = selected;
      self.selected.reload();
      localStorage.setItem("selectedTab", self.selected.id);
    },

    setTask(params = {}) {
      if (params.taskID !== undefined) {
        console.log("set with completion");
        self.taskStore.setSelected(params.taskID);
        self.annotationStore.setSelected(params.id);
      } else {
        console.log("set task");
        self.taskStore.setSelected(params.id);
      }
    },

    deleteView: flow(function* (view) {
      if (self.selected === view) {
        const index = self.views.indexOf(view);
        const newView =
          index === 0 ? self.views[index + 1] : self.views[index - 1];
        self.setSelected(newView.key);
      }

      yield view.delete();
      destroy(view);
    }),

    addView: flow(function* (viewSnapshot) {
      const lastView = self.views[self.views.length - 1];

      const newView = self.createView({
        ...(viewSnapshot ?? {}),
        id: (lastView?.id ?? -1) + 1,
        title: `${lastView?.title ?? "Tab"} ${self.views.length}`,
        key: guidGenerator(),
      });

      self.views.push(newView);
      self.setSelected(newView);
      console.log("Tab created");
      yield newView.save();

      return newView;
    }),

    duplicateView(view) {
      self.addView(getSnapshot(view));
    },

    createView(viewSnapshot) {
      console.log({ viewSnapshot });
      return View.create(viewSnapshot ?? {});
    },

    expandFilters() {
      self.sidebarEnabled = true;
      self.sidebarVisible = true;
    },

    collapseFilters() {
      self.sidebarEnabled = false;
      self.sidebarVisible = false;
    },

    toggleSidebar() {
      self.sidebarVisible = !self.sidebarVisible;
    },

    fetchColumns: flow(function* () {
      const { columns } = yield getParent(self).API.columns();
      const targets = unique(columns.map((c) => c.target));

      targets.forEach((t) => {
        self.columnsTargetMap.set(t, []);
      });

      columns.forEach((c) => {
        const { target } = c;

        const columnID = `${target}-${c.id}`;
        const parent = c.parent ? `${target}-${c.parent}` : undefined;
        const children = c.children
          ? c.children.map((ch) => `${target}-${ch}`)
          : undefined;

        const column = ViewColumn.create({
          ...c,
          id: columnID,
          filters: c.filters ?? [],
          alias: c.id,
          parent,
          children,
        });

        self.columnsTargetMap.get(c.target).push(column);

        if (!c.children) {
          self.availableFilters.push({
            id: `${columnID}-filter`,
            type: c.type,
            field: columnID,
            schema: c.schema ?? null,
          });
        }
      });
    }),

    fetchViews: flow(function* () {
      const { tabs } = yield getParent(self).API.tabs();

      self.views.push(...tabs.map(self.createView));

      const selected = localStorage.getItem("selectedTab");
      const selectedView = self.views.find((v) => v.id === Number(selected));
      self.setSelected(selectedView ?? self.views[0]);
    }),
  }));
