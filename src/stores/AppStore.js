import { notification } from "antd";
import { flow, getRoot, types } from "mobx-state-tree";
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

    serverError: types.map(CustomJSON),
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
      self.project = yield getRoot(self).apiCall("project");
    }),

    fetchData: flow(function* () {
      self.loading = true;

      yield self.fetchProject();
      yield self.viewsStore.fetchColumns();
      yield self.viewsStore.fetchViews();

      self.loading = false;
    }),

    apiCall: flow(function* (methodName, params, body) {
      let result = yield self.API[methodName](params, body);

      if (result.error) {
        console.log({ result });

        if (result.response) {
          self.serverError.set(methodName, {
            error: "Something went wrong",
            response: result.response,
          });
        }

        notification.error({
          message: "Error occurred when loading data",
          description: result?.response?.detail ?? result.error,
        });
      } else {
        self.serverError.delete(methodName);
      }

      return result;
    }),
  }));
