import { flow, getRoot, types } from "mobx-state-tree";
import { TaskModel } from "./model";

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
    buildLSFCallbacks() {
      return {
        onSubmitCompletion: function (ls, c, res) {
          const { task } = self;

          if (task) {
            if ("completions" in task) task.completions.push(c);
            else task.completions = [c];
          }
        },
        onTaskLoad: function (ls) {},
        onUpdateCompletion: function (ls, c) {
          // TODO needs to update the update date
        },
        onDeleteCompletion: function (ls, c) {
          const { task } = self;
          if (task && task.completions) {
            const cidx = task.completions.findIndex((tc) => tc.id === c.id);
            task.completions.splice(cidx, 1);
          }
        },
        onSkipTask: function (ls) {
          // TODO need to update the task status
        },
        onLabelStudioLoad: function (ls) {},
      };
    },

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
    const afterAttach = () => {
      self.fetchTasks();
    };

    const loadTask = flow(function* (id) {
      let remoteTask;
      const api = getRoot(self).API;

      if (id) {
        remoteTask = yield api.task({ data: { id: id } });
      } else {
        remoteTask = yield api.next();
        id = remoteTask.id;
      }

      let task = self.data.find((t) => t.id === id);

      if (task) {
        task.update(remoteTask);
      } else {
        task = TaskModel.create(remoteTask);
        self.data.push(task);
      }

      return task;
    });

    const fetchTasks = flow(function* () {
      self.loading = true;

      const data = yield getRoot(self).API.tasks({
        data: {
          page: self.page,
          page_size: self.pageSize,
        },
      });

      console.log({ fetched: data });

      const loaded = self.setData(data);

      if (loaded) self.page += 1;

      self.loading = false;
      getRoot(self).viewsStore.selected.afterAttach();
    });

    const setData = ({ tasks, total }) => {
      if (tasks.length > 0) {
        self.totalTasks = total;
        self.data.push(...(tasks ?? []));
        console.log({ data: self.data });
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
      afterAttach,
      fetchTasks,
      loadTask,
      setData,
      getDataFields,
      setTask,
      unsetTask,
    };
  });
