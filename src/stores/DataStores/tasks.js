import { flow, types } from "mobx-state-tree";
import { DataStore, DataStoreItem } from "../../mixins/DataStore";
import { getCompletionSnapshot } from "../../sdk/lsf-utils";
import { DynamicModel } from "../DynamicModel";
import { CustomJSON } from "../types";

export const create = (columns) => {
  const TaskModelBase = DynamicModel("TaskModelBase", columns, {
    completions: types.optional(types.array(CustomJSON), []),
    predictions: types.optional(types.array(CustomJSON), []),
    source: types.maybeNull(types.string),
  })
    .views((self) => ({
      get lastCompletion() {
        return self.completions[this.completions.length - 1];
      },
    }))
    .actions((self) => ({
      mergeCompletions(completions) {
        self.completions = completions.map((c) => {
          const existingCompletion = self.completions.find(
            (ec) => ec.id === Number(c.pk)
          );

          if (existingCompletion) {
            return existingCompletion;
          } else {
            return {
              id: c.id,
              pk: c.pk,
              result: c.serializeCompletion(),
              leadTime: c.leadTime,
              userGenerate: !!c.userGenerate,
              sentUserGenerate: !!c.sentUserGenerate,
            };
          }
        });
      },

      updateCompletion(completion) {
        const existingCompletion = self.completions.find((c) => {
          return c.id === Number(completion.pk) || c.pk === completion.pk;
        });

        if (existingCompletion) {
          Object.assign(existingCompletion, getCompletionSnapshot(completion));
        } else {
          self.completions.push(getCompletionSnapshot(completion));
        }
      },

      deleteCompletion(completion) {
        const index = self.completions.findIndex((c) => {
          return c.id === Number(completion.pk) || c.pk === completion.pk;
        });

        if (index >= 0) self.completions.splice(index, 1);
      },
    }));

  const TaskModel = types.compose("TaskModel", TaskModelBase, DataStoreItem);

  return DataStore("TasksStore", {
    apiMethod: "tasks",
    listItemType: TaskModel,
    properties: {
      totalCompletions: 0,
      totalPredictions: 0,
    },
  })
    .actions((self) => ({
      loadTask: flow(function* (taskID, { select = true } = {}) {
        let task = null;

        self.setLoading(taskID);

        if (taskID !== undefined) {
          task = yield self.updateTaskByID(taskID);
        } else {
          if (self.selected) {
            yield self.updateTaskByID(self.selected.id);
          }
          task = yield self.loadNextTask();
        }

        if (select !== false) self.setSelected(task);

        self.finishLoading(taskID);

        return task;
      }),

      updateTaskByID: flow(function* (taskID) {
        const taskData = yield self.root.apiCall("task", { taskID });
        return self.applyTaskSnapshot(taskData, taskID);
      }),

      loadNextTask: flow(function* () {
        const taskData = yield self.root.invokeAction("next_task", {
          reload: false,
        });
        return self.applyTaskSnapshot(taskData);
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
        const { total_completions, total_predictions } = data;

        if (total_completions !== null)
          self.totalCompletions = total_completions;
        if (total_predictions !== null)
          self.totalPredictions = total_predictions;
      },
    }))
    .preProcessSnapshot((snapshot) => {
      const { total_completions, total_predictions, ...sn } = snapshot;

      return {
        ...sn,
        totalCompletions: total_completions,
        totalPredictions: total_predictions,
      };
    });
};
