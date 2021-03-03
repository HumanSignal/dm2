import { isDefined } from "../utils/utils";

/** @type {import("../utils/api-proxy").APIProxyOptions} */
export const APIConfig = {
  gateway: "/api/dm",
  endpoints: {
    /** Project base info */
    project: "/project",

    /** Available columns/fields of the dataset */
    columns: "/columns",

    /** Tabs (materialized views) */
    tabs: "/views",

    /** Creates a new tab */
    createTab: {
      path: "/views",
      method: "post",
    },

    /** Update particular tab (PATCH) */
    updateTab: {
      path: "/views/:tabID",
      method: "patch",
    },

    /** Delete particular tab (DELETE) */
    deleteTab: {
      path: "/views/:tabID",
      method: "delete",
    },

    /** List of tasks (samples) in the dataset */
    tasks: "/views/:tabID/tasks",

    /** Per-task annotations (completions, predictions) */
    annotations: "/views/:tabID/annotations",

    /** Single task (sample) */
    task: "/tasks/:taskID",

    /** Next task (labelstream, default sequential) */
    nextTask: "/tasks/next",

    /** Single annotation */
    completion: "/tasks/:taskID/completions/:id",

    /** Single annotation */
    completions: "/../tasks/:taskID/completions",

    /** Mark sample as skipped */
    skipTask: {
      path: (params) => {
        const pathBase = "/../tasks/:taskID/completions";
        const isNewCompletion = !isDefined(params.completionID);
        return isNewCompletion ? pathBase : `${pathBase}/:completionID`;
      },
      method: "post",
    },

    /** Submit annotation */
    submitCompletion: {
      path: "/../tasks/:taskID/completions",
      method: "post",
    },

    /** Update annotation */
    updateCompletion: {
      path: "/../completions/:completionID",
      method: "patch",
    },

    /** Delete annotation */
    deleteCompletion: {
      path: "/../completions/:completionID",
      method: "delete",
    },

    /** Override selected items list (checkboxes) */
    setSelectedItems: {
      path: "/views/:tabID/selected-items",
      method: "post",
    },

    /** Add item to the current selection */
    addSelectedItem: {
      path: "/views/:tabID/selected-items",
      method: "patch",
    },

    /** List of available actions */
    actions: "/actions",

    /** Subtract item from the current selection */
    deleteSelectedItem: {
      path: "/views/:tabID/selected-items",
      method: "delete",
    },

    /** Invoke a particular action */
    invokeAction: {
      path: "/actions",
      method: "post",
    },
  },
};
