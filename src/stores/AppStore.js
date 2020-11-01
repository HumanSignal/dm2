import { flow, types } from "mobx-state-tree";
import { TasksStore } from "./Tasks";
import { CustomJSON } from "./types";
import { ViewsStore } from "./Views";

export const AppStore = types
  .model("AppStore", {
    mode: types.optional(
      types.enumeration(["explorer", "labelstream"]),
      "explorer"
    ),

    tasksStore: types.optional(TasksStore, {}),

    viewsStore: types.optional(ViewsStore, {
      views: [],
    }),

    project: types.optional(CustomJSON, {}),

    loading: types.optional(types.boolean, false),
  })
  .views((self) => ({
    get SDK() {
      return self._sdk;
    },

    get API() {
      return self.SDK.api;
    },

    get isLabeling() {
      return !!self.tasksStore.task;
    },

    get isLabelStreamMode() {
      return self.mode === "labelstream";
    },

    get isExplorerMode() {
      return self.mode === "explorer";
    },
  }))
  .actions((self) => ({
    setMode(mode) {
      self.mode = mode;
    },

    fetchProject: flow(function* () {
      self.project = yield self.API.project();
    }),

    fetchData: flow(function* () {
      self.loading = true;

      yield self.fetchProject();
      yield self.viewsStore.fetchColumns();
      yield self.viewsStore.fetchFilters();
      yield self.viewsStore.fetchViews();
      yield self.tasksStore.fetchTasks();

      self.loading = false;
    }),
  }));
