import { flow, types } from "mobx-state-tree";
import { AnnotationStore } from "./Annotations";
import { TasksStore } from "./Tasks";
import { CustomJSON } from "./types";
import { ViewsStore } from "./Views";

export const AppStore = types
  .model("AppStore", {
    mode: types.optional(
      types.enumeration(["explorer", "labelstream"]),
      "explorer"
    ),

    viewsStore: types.optional(ViewsStore, {
      views: [],
    }),

    project: types.optional(CustomJSON, {}),

    loading: types.optional(types.boolean, false),

    taskStore: types.optional(TasksStore, {}),
    annotationStore: types.optional(AnnotationStore, {}),
  })
  .views((self) => ({
    get SDK() {
      return self._sdk;
    },

    get API() {
      return self.SDK.api;
    },

    get isLabeling() {
      return !!self.dataStore?.selected || self.isLabelStreamMode;
    },

    get isLabelStreamMode() {
      return self.mode === "labelstream";
    },

    get isExplorerMode() {
      return self.mode === "explorer";
    },

    get currentView() {
      return self.viewsStore.selected;
    },

    get dataStore() {
      switch (self.target) {
        case "tasks":
          return self.taskStore;
        case "annotations":
          return self.annotationStore;
        default:
          return null;
      }
    },

    get target() {
      return self.viewsStore.selected?.target ?? "tasks";
    },
  }))
  .actions((self) => ({
    setMode(mode) {
      self.mode = mode;
    },

    unsetTask() {
      self.annotationStore.unset();
      self.taskStore.unset();
    },

    fetchProject: flow(function* () {
      self.project = yield self.API.project();
    }),

    fetchData: flow(function* () {
      self.loading = true;

      yield self.fetchProject();
      console.log("Project loaded");
      yield self.viewsStore.fetchColumns();
      console.log("Columns set up. Filter types initialized.");
      yield self.viewsStore.fetchViews();
      console.log("Views loaded. Current view is set to %O", self.currentView);

      self.loading = false;
    }),
  }));
