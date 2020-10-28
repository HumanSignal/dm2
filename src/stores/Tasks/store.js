import { flow, getRoot, types } from "mobx-state-tree";
import { TaskModel } from "./task";

export const TasksStore = types
  .model("TasksStore", {
    data: types.optional(types.array(TaskModel), []),
    task: types.maybeNull(types.safeReference(TaskModel)),
    page: types.optional(types.integer, 1),
    pageSize: types.optional(types.integer, 20),
    totalTasks: types.optional(types.integer, 0),
    loading: types.optional(types.boolean, false),
  })
  .views((self) => ({
    get annotationsData() {
      return self.data
        .map((t) => {
          return t.completions
            ? t.completions.map((c) => {
                c["annotation_id"] = c.id;
                c["task_id"] = t.id;
                c["data"] = t.data;

                return c;
              })
            : [];
        })
        .flat();
    },
  }))
  .actions((self) => {
    const api = getRoot(self).API;

    const loadTask = flow(function* (taskID) {
      let remoteTask;

      if (taskID !== undefined) {
        remoteTask = yield api.task({ taskID });
      } else {
        remoteTask = yield api.nextTask({
          projectID: getRoot(self).project.id,
        });
      }

      taskID = taskID ?? remoteTask.id;

      const taskData = { ...remoteTask, source: JSON.stringify(remoteTask) };
      let task = self.data.find((t) => t.id === taskID);

      console.log({ remoteTask, task, ids: self.data.map((t) => t.id) });

      if (task) {
        console.log("Updating existing task", task);
        task.update(taskData);
      } else {
        task = TaskModel.create(taskData);
        self.data.push(task);
      }

      self.setTask(task.id);

      return task;
    });

    const fetchTasks = flow(function* () {
      self.loading = true;

      const data = yield api.tasks({
        page: self.page,
        page_size: self.pageSize,
      });

      console.table(data.tasks);

      const loaded = self.setData(data);

      if (loaded) self.page += 1;

      self.loading = false;

      getRoot(self).viewsStore.selected.afterAttach();
    });

    const setData = ({ tasks, total }) => {
      if (tasks.length > 0) {
        const newTasks = tasks.map((t) => ({
          ...t,
          source: JSON.stringify(t),
        }));
        self.totalTasks = total;
        self.data.push(...newTasks);
        return true;
      }
      return false;
    };

    const getDataFields = () => {
      const { data } = self;
      return data ? Object.keys(data[0]?.["data"] || {}) : null;
    };

    const setTask = (val) => {
      self.task = val;
    };

    const unsetTask = () => {
      self.task = undefined;
    };

    return {
      fetchTasks,
      loadTask,
      setData,
      getDataFields,
      setTask,
      unsetTask,
    };
  });
