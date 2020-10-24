import { types } from "mobx-state-tree";
import { TasksStore } from "./Tasks";
import { ViewsStore } from "./Views";

export default types
  .model("dmAppStore", {
    mode: types.optional(types.enumeration(["dm", "label"]), "dm"),

    tasksStore: types.optional(TasksStore, {}),

    viewsStore: types.optional(ViewsStore, {
      views: [],
    }),
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
  }));
