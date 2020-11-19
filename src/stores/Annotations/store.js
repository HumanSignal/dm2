import { flow, getRoot } from "mobx-state-tree";
import { InfiniteList } from "../../mixins/InfiniteList";
import { Annotation } from "./annotation";

export const AnnotationStore = InfiniteList("AnnotationStore", {
  apiMethod: "annotations",
  listItemType: Annotation,
}).actions((self) => ({
  loadTask: flow(function* (annotationID) {
    let remoteTask;
    const rootStore = getRoot(self);

    if (annotationID !== undefined) {
      remoteTask = yield rootStore.apiCall("task", { taskID: annotationID });
    } else {
      remoteTask = yield rootStore.apiCall("nextTask", {
        projectID: getRoot(self).project.id,
      });
    }

    annotationID = annotationID ?? remoteTask.id;

    const annotation = self.updateItem(annotationID, {
      ...remoteTask,
      source: JSON.stringify(remoteTask),
    });

    self.setSelected(annotation.id);

    return annotation;
  }),

  unsetTask() {
    self.unset();
  },
}));
