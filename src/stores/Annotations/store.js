import { flow, getRoot } from "mobx-state-tree";
import { InfiniteList } from "../../mixins/InfiniteList";
import { Annotation } from "./annotation";

export const AnnotationStore = InfiniteList("AnnotationStore", {
  apiMethod: "annotations",
  listItemType: Annotation,
}).actions((self) => ({
  loadTask: flow(function* (taskID) {
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

    self.setTask(task.id);

    return task;
  }),
}));
