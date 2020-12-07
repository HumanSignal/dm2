import { flow, getRoot, types } from "mobx-state-tree";
import { InfiniteList, InfiniteListItem } from "../../mixins/InfiniteList";
import { DynamicModel } from "../DynamicModel";
import { CustomJSON } from "../types";

export const create = (columns) => {
  const TaskModelBase = DynamicModel("TaskModelBase", columns, {
    /* TODO: might need to be converted to a store at some point */
    completions: types.optional(types.array(CustomJSON), []),
    predictions: types.optional(types.array(CustomJSON), []),
  }).views((self) => ({
    get lastCompletion() {
      return self.completions[this.completions.length - 1];
    },
  }));

  const TaskModel = types.compose("TaskModel", TaskModelBase, InfiniteListItem);

  return InfiniteList("TasksStore", {
    apiMethod: "tasks",
    listItemType: TaskModel,
  }).actions((self) => ({
    loadTask: flow(function* (taskID) {
      let remoteTask;
      const rootStore = getRoot(self);

      if (taskID !== undefined) {
        remoteTask = yield rootStore.apiCall("task", { taskID });
      } else {
        remoteTask = yield rootStore.invokeAction("next_task", {
          reload: false,
        });
      }

      taskID = taskID ?? remoteTask.id;

      const task = self.updateItem(taskID, {
        ...remoteTask,
        source: JSON.stringify(remoteTask),
      });

      self.setSelected(task);

      return task;
    }),

    unsetTask() {
      self.unset();
    },
  }));
};
