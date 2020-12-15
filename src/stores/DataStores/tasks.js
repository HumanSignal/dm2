import { flow, getRoot, types } from "mobx-state-tree";
import { InfiniteList, InfiniteListItem } from "../../mixins/InfiniteList";
import { DynamicModel } from "../DynamicModel";
import { CustomJSON } from "../types";

export const create = (columns) => {
  const TaskModelBase = DynamicModel("TaskModelBase", columns, {
    /* TODO: might need to be converted to a store at some point */
    completions: types.optional(types.array(CustomJSON), []),
    predictions: types.optional(types.array(CustomJSON), []),
  })
    .views((self) => ({
      get lastCompletion() {
        return self.completions[this.completions.length - 1];
      },
    }))
    .actions((self) => ({
      mergeCompletions(completions) {
        console.log("Merging completions");

        self.completions = completions.map((c) => {
          const existingCompletion = self.completions.find(
            (ec) => ec.id === Number(c.pk)
          );

          const completionSnapshot = {
            id: c.id,
            pk: c.pk,
            result: c.serializeCompletion(),
            leadTime: c.leadTime,
            userGenerate: !!c.userGenerate,
            sentUserGenerate: !!c.sentUserGenerate,
          };

          if (existingCompletion) {
            return {
              ...completionSnapshot,
              ...existingCompletion,
              userGenerate: false,
              sentUserGenerate: false,
            };
          } else {
            return completionSnapshot;
          }
        });
      },
    }));

  const TaskModel = types.compose("TaskModel", TaskModelBase, InfiniteListItem);

  const TaskStoreModel = InfiniteList("TasksStore", {
    apiMethod: "tasks",
    listItemType: TaskModel,
    properties: {
      totalCompletions: 0,
      totalPredictions: 0,
    },
  }).actions((self) => ({
    loadTask: flow(function* (taskID) {
      let remoteTask,
        task = null;
      const rootStore = getRoot(self);
      self.setLoading(taskID);

      if (taskID !== undefined) {
        console.log("Loading task", taskID);
        remoteTask = yield rootStore.apiCall("task", { taskID });
      } else {
        console.log("Loading next task");
        remoteTask = yield rootStore.invokeAction("next_task", {
          reload: false,
        });
      }

      if (remoteTask && !remoteTask?.error) {
        task = self.updateItem(taskID ?? remoteTask.id, {
          ...remoteTask,
          source: JSON.stringify(remoteTask),
        });
      }

      self.setSelected(task);

      self.finishLoading(taskID);
      console.log("Loading finished");

      return task;
    }),

    unsetTask() {
      self.unset();
    },

    postProcessData(data) {
      const { total_completions, total_predictions } = data;

      self.totalCompletions = total_completions;
      self.totalPredictions = total_predictions;
    },
  }));

  return types.snapshotProcessor(TaskStoreModel, {
    preProcessor(snapshot) {
      const { total_completions, total_predictions, ...sn } = snapshot;

      return {
        ...sn,
        totalCompletions: total_completions,
        totalPredictions: total_predictions,
      };
    },
  });
};
