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
      console.log("Fetching initial data");
      yield self.fetchProject();
      console.log("Project fetched");
      if (!self.isLabelStreamMode) {
        yield self.tasksStore.fetchTasks();
        console.log("Tasks loaded");
      }
      console.log("Fetch finished");
    }),
  }));
