import { flow, getRoot, types } from "mobx-state-tree";

const Dictionary = types.custom({
  name: "Dictionary",
  toSnapshot(value) {
    return JSON.stringify(value);
  },
  fromSnapshot(value) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  },
  isTargetType(value) {
    return typeof value === "object";
  },
});

const TaskModel = types.model("TaskModel", {
  id: types.identifierNumber,
  data: types.optional(Dictionary, {}),
  accuracy: types.maybeNull(types.integer),
  is_labeled: types.optional(types.boolean, false),
  created_at: types.optional(types.maybeNull(types.string), null),
  updated_at: types.optional(types.maybeNull(types.string), null),
  overlap: types.optional(types.maybeNull(types.integer), null),
  project: types.optional(types.maybeNull(types.integer), null),
});

export default types
  .model("TasksStore", {
    data: types.optional(types.array(TaskModel), []),
    task: types.maybeNull(types.safeReference(TaskModel)),
    page: types.optional(types.integer, 1),
    pageSize: types.optional(types.integer, 20),
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

    const fetchTasks = flow(function* () {
      self.setData(
        yield getRoot(self).API.tasks({
          data: {
            page: self.page,
            page_size: self.pageSize,
          },
        })
      );

      self.page += 1;
      getRoot(self).viewsStore.selected.afterAttach();
    });

    const setData = (val) => {
      self.data.push(...(val ?? []));
    };

    const getDataFields = () => {
      const { data } = self;
      return data ? Object.keys(data[0]?.["data"] || {}) : null;
    };

    const setTask = (val) => {
      self.task = val;
    };

    return {
      afterAttach,
      fetchTasks,
      setData,
      getDataFields,
      setTask,
    };
  });
