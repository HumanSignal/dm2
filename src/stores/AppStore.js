import { types } from "mobx-state-tree";
import TasksStore from "./TasksStore";
import { ViewsStore } from "./ViewsStore";

export default types
  .model("dmAppStore", {
    mode: types.optional(types.enumeration(["dm", "label"]), "dm"),

    tasksStore: types.optional(TasksStore, {}),

    viewsStore: types.optional(ViewsStore, {
      views: [],
    }),
  })
  .views((self) => ({
    get API() {
      return self._api;
    },
  }))
  .actions((self) => ({
    setMode(mode) {
      self.mode = mode;
    },
  }));
