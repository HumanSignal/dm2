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

    if (taskID !== undefined) {
      remoteTask = yield self.API.task({ taskID });
    } else {
      remoteTask = yield self.API.nextTask({
        projectID: getRoot(self).project.id,
      });
    }

    taskID = taskID ?? remoteTask.id;

    const task = self.updateItem(taskID, {
      ...remoteTask,
      source: JSON.stringify(remoteTask),
    });

    self.setSelected(task.id);

    return task;
  }),
}));
