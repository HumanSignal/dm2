import { flow, getRoot, types } from "mobx-state-tree";
import { DataStore, DataStoreItem } from "../../mixins/DataStore";
import { getAnnotationSnapshot } from "../../sdk/lsf-utils";
import { isDefined } from "../../utils/utils";
import { DynamicModel } from "../DynamicModel";
import { CustomJSON } from "../types";
import { User } from "../Users";

export const create = (columns) => {
  const TaskModelBase = DynamicModel("TaskModelBase", columns, {
    annotators: types.optional(types.array(types.late(() => types.reference(User))), []),
    reviewers: types.optional(types.array(types.late(() => types.reference(User))), []),
    annotations: types.optional(types.array(CustomJSON), []),
    predictions: types.optional(types.array(CustomJSON), []),
    drafts: types.frozen(),
    source: types.maybeNull(types.string),
    was_cancelled: false,
  })
    .views((self) => ({
      get lastAnnotation() {
        return self.annotations[this.annotations.length - 1];
      },
    }))
    .actions((self) => ({
      mergeAnnotations(annotations) {
        self.annotations = annotations.map((c) => {
          const existingAnnotation = self.annotations.find(
            (ec) => ec.id === Number(c.pk)
          );

          if (existingAnnotation) {
            return existingAnnotation;
          } else {
            return {
              id: c.id,
              pk: c.pk,
              result: c.serializeAnnotation(),
              leadTime: c.leadTime,
              userGenerate: !!c.userGenerate,
              sentUserGenerate: !!c.sentUserGenerate,
            };
          }
        });
      },

      updateAnnotation(annotation) {
        const existingAnnotation = self.annotations.find((c) => {
          return c.id === Number(annotation.pk) || c.pk === annotation.pk;
        });

        if (existingAnnotation) {
          Object.assign(existingAnnotation, getAnnotationSnapshot(annotation));
        } else {
          self.annotations.push(getAnnotationSnapshot(annotation));
        }
      },

      deleteAnnotation(annotation) {
        const index = self.annotations.findIndex((c) => {
          return c.id === Number(annotation.pk) || c.pk === annotation.pk;
        });

        if (index >= 0) self.annotations.splice(index, 1);
      },

      loadAnnotations: flow(function* () {
        const annotations = yield Promise.all([
          getRoot(self).apiCall("annotations", { taskID: self.id }),
        ]);

        self.annotations = annotations[0];
      }),
    }));

  const TaskModel = types.compose("TaskModel", TaskModelBase, DataStoreItem);

  return DataStore("TasksStore", {
    apiMethod: "tasks",
    listItemType: TaskModel,
    properties: {
      totalAnnotations: 0,
      totalPredictions: 0,
    },
  })
    .actions((self) => ({
      loadTask: flow(function* (taskID, { select = true } = {}) {
        if (!isDefined(taskID)) {
          console.warn("Task ID must be provided");
          return;
        }

        self.setLoading(taskID);

        const taskData = yield self.root.apiCall("task", { taskID });
        const drafts = yield self.root.apiCall("taskDrafts", { taskID });
        if (drafts) taskData.drafts = drafts;

        if (taskData.predictions) {
          taskData.predictions.forEach((p) => {
            p.created_by = (p.model_version?.trim() ?? "") || p.created_by;
          });
        }

        const task = self.applyTaskSnapshot(taskData, taskID);

        if (select !== false) self.setSelected(task);

        self.finishLoading(taskID);

        return task;
      }),

      loadNextTask: flow(function* ({ select = true } = {}) {
        const taskData = yield self.root.invokeAction("next_task", {
          reload: false,
        });

        const task = self.applyTaskSnapshot(taskData);

        if (select !== false) self.setSelected(task);

        return task;
      }),

      applyTaskSnapshot(taskData, taskID) {
        let task;

        if (taskData && !taskData?.error) {
          task = self.updateItem(taskID ?? taskData.id, {
            ...taskData,
            source: JSON.stringify(taskData),
          });
        }

        return task;
      },

      unsetTask() {
        self.unset();
      },

      postProcessData(data) {
        const { total_annotations, total_predictions } = data;

        if (total_annotations !== null)
          self.totalAnnotations = total_annotations;
        if (total_predictions !== null)
          self.totalPredictions = total_predictions;
      },
    }))
    .preProcessSnapshot((snapshot) => {
      const { total_annotations, total_predictions, ...sn } = snapshot;

      return {
        ...sn,
        totalAnnotations: total_annotations,
        totalPredictions: total_predictions,
      };
    });
};
