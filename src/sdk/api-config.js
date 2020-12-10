import { isDefined } from "../utils/utils";

/** @type {import("../utils/api-proxy").APIProxyOptions} */
export const APIConfig = {
  gateway: "/api",
  endpoints: {
    project: "/project",
    columns: "/project/columns",
    tabs: "/project/tabs",
    updateTab: {
      path: "/project/tabs/:tabID",
      method: "post",
    },
    deleteTab: {
      path: "/project/tabs/:tabID",
      method: "delete",
    },

    tasks: "/project/tabs/:tabID/tasks",
    annotations: "/project/tabs/:tabID/annotations",

    task: "/tasks/:taskID",
    nextTask: "/project/next",

    completion: "/tasks/:taskID/completions/:id",
    skipTask: {
      path: (params) => {
        const pathBase = "/tasks/:taskID/completions";
        const isNewCompletion = !isDefined(params.completionID);
        return isNewCompletion ? pathBase : `${pathBase}/:completionID`;
      },
      method: "post",
    },
    submitCompletion: {
      path: "/tasks/:taskID/completions",
      method: "post",
    },
    updateCompletion: {
      path: "/tasks/:taskID/completions/:completionID",
      method: "post",
    },
    deleteCompletion: {
      path: "/tasks/:taskID/completions/:completionID",
      method: "delete",
    },

    setSelectedItems: {
      path: "/project/tabs/:tabID/selected-items",
      method: "post",
    },
    addSelectedItem: {
      path: "/project/tabs/:tabID/selected-items",
      method: "patch",
    },
    deleteSelectedItem: {
      path: "/project/tabs/:tabID/selected-items",
      method: "delete",
    },

    actions: "/project/actions",
    invokeAction: {
      path: "/project/tabs/:tabID/actions",
      method: "post",
    },
  },
};
