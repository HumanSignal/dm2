import { flow, types } from "mobx-state-tree";
import { Modal } from "../components/Common/Modal/Modal";
import { History } from "../utils/history";
import { isDefined } from "../utils/utils";
import * as DataStores from "./DataStores";
import { DynamicModel, registerModel } from "./DynamicModel";
import { TabStore } from "./Tabs";
import { CustomJSON } from "./types";

export const AppStore = types
  .model("AppStore", {
    mode: types.optional(
      types.enumeration(["explorer", "labelstream", "labeling"]),
      "explorer"
    ),

    viewsStore: types.optional(TabStore, {
      views: [],
    }),

    project: types.optional(CustomJSON, {}),

    loading: types.optional(types.boolean, false),

    taskStore: types.optional(
      types.late(() => {
        return DynamicModel.get("tasksStore");
      }),
      {}
    ),

    annotationStore: types.optional(
      types.late(() => {
        return DynamicModel.get("annotationsStore");
      }),
      {}
    ),

    availableActions: types.optional(types.array(CustomJSON), []),

    serverError: types.map(CustomJSON),

    crashed: false,
  })
  .views((self) => ({
    get SDK() {
      return self._sdk;
    },

    get LSF() {
      return self.SDK.lsf;
    },

    get API() {
      return self.SDK.api;
    },

    get apiVersion() {
      return self.SDK.apiVersion;
    },

    get isLabeling() {
      return !!self.dataStore?.selected || self.isLabelStreamMode;
    },

    get isLabelStreamMode() {
      return self.mode === "labelstream";
    },

    get isExplorerMode() {
      return self.mode === "explorer" || self.mode === 'labeling';
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

    get labelingIsConfigured() {
      return self.project?.config_has_control_tags === true;
    },

    get labelingConfig() {
      return self.project.label_config_line ?? self.project.label_config;
    },

    get showPreviews() {
      return this.SDK.showPreviews;
    },
  }))
  .actions((self) => ({
    startPolling() {
      if (self._poll) return;
      if (self.SDK.polling === false) return;

      const poll = async (self) => {
        await self.fetchProject({ interaction: "timer" });
        self._poll = setTimeout(() => poll(self), 10000);
      };

      poll(self);
    },

    beforeDestroy() {
      clearTimeout(self._poll);
    },

    setMode(mode) {
      self.mode = mode;
    },

    setTask: flow(function* ({ taskID, annotationID, pushState }) {
      if (pushState !== false) {
        History.navigate({ task: taskID, annotation: annotationID ?? null });
      }

      yield self.taskStore.loadTask(taskID, {
        select: !!taskID && !!annotationID,
      });

      if (annotationID !== undefined) {
        self.annotationStore.setSelected(annotationID);
      } else {
        self.taskStore.setSelected(taskID);
      }
    }),

    unsetTask(options) {
      self.annotationStore.unset();
      self.taskStore.unset();

      if (options?.pushState !== false) {
        History.navigate({ task: null, annotation: null });
      }
    },

    unsetSelection() {
      self.annotationStore.unset({ withHightlight: true });
      self.taskStore.unset({ withHightlight: true });
    },

    createDataStores() {
      const grouppedColumns = self.viewsStore.columns.reduce((res, column) => {
        res.set(column.target, res.get(column.target) ?? []);
        res.get(column.target).push(column);
        return res;
      }, new Map());

      grouppedColumns.forEach((columns, target) => {
        const dataStore = DataStores[target].create?.(columns);
        if (dataStore) registerModel(`${target}Store`, dataStore);
      });
    },

    startLabeling(item, options = {}) {
      const processLabeling = () => {
        if (!item && !self.dataStore.selected) {
          self.SDK.setMode("labelstream");

          if (options?.pushState !== false) {
            History.navigate({ labeling: 1 });
          }
          return;
        }

        if (self.dataStore.loadingItem) return;

        self.SDK.setMode("labeling");

        if (item && !item.isSelected) {
          const labelingParams = {
            pushState: options?.pushState,
          };

          if (isDefined(item.task_id)) {
            Object.assign(labelingParams, {
              annotationID: item.id,
              taskID: item.task_id,
            });
          } else {
            Object.assign(labelingParams, {
              taskID: item.id,
            });
          }

          self.setTask(labelingParams);
        } else {
          self.closeLabeling();
        }
      };

      if (!self.labelingIsConfigured) {
        Modal.confirm({
          title: "You're almost there!",
          body:
            "Before you can annotate the data, set up labeling configuration",
          onOk() {
            self.SDK.invoke("settingsClicked");
          },
          okText: "Go to setup",
        });
      } else {
        processLabeling.call(self);
      }
    },

    closeLabeling(options) {
      const { SDK } = self;

      self.unsetTask(options);
      SDK.setMode("explorer");
      SDK.destroyLSF();
    },

    resolveURLParams() {
      window.addEventListener("popstate", ({ state }) => {
        const { tab, task, annotation, labeling } = state ?? {};

        if (tab) {
          self.viewsStore.setSelected(parseInt(tab), {
            pushState: false,
          });
        }

        if (task) {
          const params = {};
          if (annotation) {
            params.task_id = parseInt(task);
            params.id = parseInt(annotation);
          } else {
            params.id = parseInt(task);
          }

          self.startLabeling(params, { pushState: false });
        } else if (labeling) {
          self.startLabeling(null, { pushState: false });
        } else {
          self.closeLabeling({ pushState: false });
        }
      });
    },

    fetchProject: flow(function* (options = {}) {
      const oldProject = JSON.stringify(self.project ?? {});
      const params =
        options && options.interaction
          ? {
            interaction: options.interaction,
          }
          : null;

      try {
        const newProject = yield self.apiCall("project", params);

        if (JSON.stringify(newProject ?? {}) !== oldProject) {
          self.project = newProject;
        }
      } catch {
        self.crash();
        return false;
      }
      return true;
    }),

    fetchActions: flow(function* () {
      self.availableActions = yield self.apiCall("actions");
    }),

    fetchData: flow(function* () {
      self.loading = true;

      const { tab, task, labeling } = History.getParams();

      if (yield self.fetchProject()) {
        yield self.fetchActions();
        self.viewsStore.fetchColumns();
        yield self.viewsStore.fetchTabs(tab, task, labeling);

        self.resolveURLParams();

        self.loading = false;

        self.startPolling();
      }
    }),

    apiCall: flow(function* (methodName, params, body) {
      let result = yield self.API[methodName](params, body);

      if (result.error && result.status !== 404) {
        if (result.response) {
          self.serverError.set(methodName, {
            error: "Something went wrong",
            response: result.response,
          });
        }

        console.warn({
          message: "Error occurred when loading data",
          description: result?.response?.detail ?? result.error,
        });

        // notification.error({
        //   message: "Error occurred when loading data",
        //   description: result?.response?.detail ?? result.error,
        // });
      } else {
        self.serverError.delete(methodName);
      }

      return result;
    }),

    invokeAction: flow(function* (actionId, options = {}) {
      const view = self.currentView;
      const needsLock =
        self.availableActions.findIndex((a) => a.id === actionId) >= 0;
      const { selected } = view;

      if (needsLock) view.lock();

      const actionParams = {
        ordering: view.ordering,
        selectedItems: selected.hasSelected
          ? selected.snapshot
          : { all: true, excluded: [] },
        filters: {
          conjunction: view.conjunction,
          items: view.serializedFilters,
        },
      };

      const result = yield self.apiCall(
        "invokeAction",
        {
          id: actionId,
          tabID: view.id,
        },
        {
          body: actionParams,
        }
      );

      if (options.reload !== false) {
        yield view.reload();
        self.fetchProject();
        view.clearSelection();
      }

      view.unlock();

      return result;
    }),

    crash() {
      self.destroy();
      self.crashed = true;
      self.SDK.invoke("crash");
    },

    destroy() {
      if (self.taskStore) {
        self.taskStore?.clear();
        self.taskStore = undefined;
      }

      if (self.annotationStore) {
        self.annotationStore?.clear();
        self.annotationStore = undefined;
      }

      clearTimeout(self._poll);
    },
  }));
