import { destroy, flow, getParent, getSnapshot, types } from "mobx-state-tree";
import { View } from "./view";
import { ViewColumn } from "./view_column";
import { FilterSchema, ViewFilterType } from "./view_filter_type";

export const ViewsStore = types
  .model("ViewsStore", {
    selected: types.safeReference(View),
    views: types.optional(types.array(View), []),
    availableFilters: types.optional(types.array(ViewFilterType), []),
    columns: types.optional(types.array(ViewColumn), []),
  })
  .views((self) => ({
    get all() {
      return self.views;
    },

    get canClose() {
      return self.all.length > 1;
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
      self.setSelected(newView);

      return newView;
    },

    duplicateView(view) {
      self.addView(getSnapshot(view));
    },

    createView(viewSnapshot) {
      const snapshot = viewSnapshot ?? {};

      if (!snapshot.hiddenColumns) {
        const hiddenColumns = self.columns
          .filter((c) => c.defaultHidden)
          .map((c) => c.id);
        console.log(hiddenColumns);
        snapshot.hiddenColumns = hiddenColumns;
      }

      const newView = View.create(snapshot);

      return newView;
    },

    fetchColumns: flow(function* () {
      const { columns } = yield getParent(self).API.columns();

      columns.forEach((c) => {
        const column = ViewColumn.create({
          ...c,
          filters: c.filters ?? [],
        });

        self.columns.push(column);

        if (!c.children) {
          if (c.id === "agreement") {
            console.log(c.schema, FilterSchema.create(c.schema));
          }
          self.availableFilters.push({
            id: `${c.id}-filter`,
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
      self.setSelected(self.views[0]);
    }),
  }));
