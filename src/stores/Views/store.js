import { destroy, flow, getParent, getSnapshot, types } from "mobx-state-tree";
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

    serialize() {
      return self.views.map((v) => v.serialize());
    },
  }))
  .actions((self) => ({
    setSelected(view) {
      if (typeof view === "string") {
        self.selected = self.views.find((v) => v.key === view);
      } else {
        self.selected = view;
      }
      self.selected.reload();
      localStorage.setItem("selectedTab", self.selected.id);
    },

    deleteView(view) {
      if (self.selected === view) {
        const index = self.views.indexOf(view);
        const newView =
          index === 0 ? self.views[index + 1] : self.views[index - 1];
        self.setSelected(newView.key);
      }

      destroy(view);
    },

    addView(viewSnapshot) {
      const lastView = self.views[self.views.length - 1];

      const newView = self.createView({
        ...(viewSnapshot ?? {}),
        id: lastView.id + 1,
        title: `${lastView.title} ${self.views.length}`,
      });

      self.views.push(newView);
      console.log("View created");
      self.setSelected(newView);

      return newView;
    },

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

        const parent = c.parent ? `${target}-${c.parent}` : undefined;
        const children = c.children
          ? c.children.map((ch) => `${target}-${ch}`)
          : undefined;

        const column = ViewColumn.create({
          ...c,
          id: `${target}-${c.id}`,
          filters: c.filters ?? [],
          alias: c.id,
          parent,
          children,
        });

        self.columnsTargetMap.get(c.target).push(column);

        if (!c.children) {
          self.availableFilters.push({
            id: `${c.id}-${c.target}-filter`,
            type: c.type,
            field: column.id,
            schema: c.schema ?? null,
          });
        }
      });
    }),

    fetchFilters: flow(function* () {
      const result = yield getParent(self).API.filters();
      self.availableFilters.push(...result);
    }),

    fetchViews: flow(function* () {
      const { tabs } = yield getParent(self).API.tabs();

      self.views.push(...tabs.map(self.createView));

      const selected = localStorage.getItem("selectedTab");
      const selectedView = self.views.find((v) => v.id === Number(selected));
      self.setSelected(selectedView ?? self.views[0]);
    }),
  }));
