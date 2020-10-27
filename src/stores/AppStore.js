import { flow, types } from "mobx-state-tree";
import { TasksStore } from "./Tasks";
import { CustomJSON } from "./types";
import { ViewsStore } from "./Views";

export const AppStore = types
  .model("dmAppStore", {
    mode: types.optional(types.enumeration(["dm", "label"]), "dm"),

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
  }))
  .actions((self) => ({
    setMode(mode) {
      self.mode = mode;
    },

    fetchProject: flow(function* () {
      self.project = yield self.API.project();
    }),
  }));
