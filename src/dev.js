import { guidGenerator } from "./utils/random";
import { randomDate } from "./utils/utils";

export const initDevApp = async (DataManager) => {
  console.log("Running in development");

  const { tasks, config } = await import("./data/image_bbox");

  tasks.forEach((t) => {
    Object.assign(t, {
      agreement: Math.random(),
      finished: !!Math.round(Math.random()),
      created_at: randomDate(
        new Date("2018-01-01"),
        new Date("2020-09-31")
      ).toISOString(),
      updated_at: randomDate(
        new Date("2018-01-01"),
        new Date("2020-09-31")
      ).toISOString(),
      data: { ...t.data, value: guidGenerator() },
      extra: { key: guidGenerator() },
    });
  });

  const findTask = (id) => tasks.find((t) => t.id === id);

  const findCompletion = (task, id) =>
    task?.completions?.find((c) => c.id === id);

  const timestamp = () => new Date().toISOString();

  const updateTask = (task, patch) => {
    const index = tasks.indexOf(task);
    tasks[index] = {
      ...task,
      ...patch,
    };
    return task;
  };

  const addCompletion = (task, completion) => {
    const completions = task.completions ?? [];

    updateTask(task, {
      completions: [...completions, completion],
    });
  };

  const createCompletion = (data) => ({
    ...data,
    id: guidGenerator(),
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    review_result: false,
    ground_truth: null,
    completed_by: 1,
  });

  const updateCompletion = (c, patch) =>
    Object.assign(c, { ...patch, id: c.id, updated_at: timestamp() });

  const datamanager = new DataManager({
    root: document.getElementById("app"),
    // mode: "labelstream",
    api: {
      gateway: "/api",
      endpoints: {
        tasks: {
          path: "/tasks",
          mock(url, urlParams) {
            const { page = 1, page_size = 20 } = urlParams;
            const offset = (page - 1) * page_size;

            return {
              tasks: tasks.slice(offset, offset + page_size),
              total: tasks.length,
            };
          },
        },
        completions: {
          path: "/tasks/:taskId/completions",
          method: "post",
          mock(url, urlParams) {
            const { id } = urlParams;
            return tasks.find((t) => t.id === id)?.completions;
          },
        },
        task: {
          path: "/tasks/:taskID",
          mock(url, urlParams) {
            const { taskID } = urlParams;
            return tasks.find((t) => t.id === taskID);
          },
        },
        nextTask: {
          path: "/projects/:projectID/next",
          method: "get",
          mock() {
            const [min, max] = [0, tasks.length - 1];
            const index = Math.floor(Math.random() * (max - min + 1)) + min;
            return tasks[index];
          },
        },
        submitCompletion: {
          path: "/tasks/:taskID/completions",
          method: "post",
          headers: {
            ContentType: "application/json",
          },
          mock(url, urlParams, request) {
            const { taskID } = urlParams;
            const completion = createCompletion(request.body);
            addCompletion(findTask(taskID), completion);

            return { id: completion.id };
          },
        },
        updateCompletion: {
          path: "/tasks/:taskID/completions/:completionID",
          method: "post",
          headers: {
            ContentType: "application/json",
          },
          mock(url, urlParams, request) {
            const { taskID, completionID } = urlParams;
            const completion = findCompletion(findTask(taskID), completionID);

            if (completion) {
              updateCompletion(completion, request.body);
            }

            return {};
          },
        },
        deleteCompletion: {
          path: "/tasks/:taskID/completions/:completionID",
          method: "delete",
          mock(url, urlParams, request) {
            const { taskID, completionID } = urlParams;
            const task = findTask(taskID);

            if (task) {
              updateTask(task, {
                completions: task.completions?.filter(
                  (c) => c.id !== completionID
                ),
              });
            }

            return task;
          },
        },
        skipTask: {
          path: "/tasks/:taskID/cancel",
          method: "post",
          mock(url, urlParams, request) {
            const { taskID } = urlParams;
            const completion = createCompletion({
              ...request.body,
              skipped: true,
            });
            addCompletion(findTask(taskID), completion);

            return { id: completion.id };
          },
        },
        project: {
          path: "/project",
          async mock() {
            return {
              id: 1,
              label_config_line: config,
              tasks_count: tasks.length,
            };
          },
        },
        columns: {
          path: "/project/columns",
          async mock() {
            return {
              columns: (await import("./data/columns")).default(
                tasks,
                {
                  image: "Image",
                  value: "Hello",
                },
                {
                  key: "Value",
                }
              ),
            };
          },
        },
        tabs: {
          path: "/project/tabs",
          async mock() {
            return {
              tabs: (await import("./data/tabs")).default,
            };
          },
        },
        filters: {
          path: "/filters",
          async mock() {
            const { filters } = await import("./data/filters");
            console.log({ availableFilters: filters });
            return filters(tasks);
          },
        },
        cancel: "/cancel",
        projects: "/projects",
        expertInstructions: "/expert_instruction",
      },
    },
    labelStudio: {
      user: {
        pk: 1,
        firstName: "James",
        lastName: "Dean",
      },
      interfaces: [
        "panel",
        "update",
        "controls",
        "side-column",
        "completions:menu",
        "completions:add-new",
        "completions:delete",
        "predictions:menu",
      ],
    },
  });

  datamanager.on("submitCompletion", (...args) =>
    console.log("submitCompletion", args)
  );
  datamanager.on("updateCompletion", (...args) =>
    console.log("updateCompletion", args)
  );
};
