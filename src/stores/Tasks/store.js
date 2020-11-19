import { flow, getRoot } from "mobx-state-tree";
import { InfiniteList } from "../../mixins/InfiniteList";
import { TaskModel } from "./task";

export const TasksStore = InfiniteList("TasksStore", {
  apiMethod: "tasks",
  listItemType: TaskModel,
}).actions((self) => ({
  loadTask: flow(function* (taskID) {
    console.log(`Loading task from server: ${taskID}`);
    let remoteTask;
    const rootStore = getRoot(self);

    if (taskID !== undefined) {
      remoteTask = yield rootStore.apiCall("task", { taskID });
    } else {
      remoteTask = yield rootStore.apiCall("nextTask", {
        projectID: getRoot(self).project.id,
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
