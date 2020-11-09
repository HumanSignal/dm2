import { guidGenerator } from "./utils/random";
import { randomDate } from "./utils/utils";

export const initDevApp = async (DataManager) => {
  console.log("Running in development");

  const { tasks, annotations, config } = await import("./data/image_bbox");
  const { default: tabs } = await import("./data/tabs");
  const useExternalSource = !!process.env.REACT_APP_USE_LSB;
  const gatewayAPI =
    process.env.REACT_APP_GATEWAY_API || "http://localhost:8080/api";

  console.log(process.env);

  tasks.forEach((t) => {
    const completions = annotations.filter((a) => a.task_id === t.id);
    Object.assign(t, {
      agreement: Math.random(),
      finished: !!completions.length,
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
      completions: completions,
    });
  });

  const timestamp = () => new Date().toISOString();

  const findEntity = (list, id) => list?.find((e) => e.id === id);

  const updateEntity = (list, entityID, patch) => {
    const entity = findEntity(list, entityID);
    const index = list.indexOf(entity);

    if (index < 0) return;

    list[index] = {
      ...entity,
      ...patch,
    };

    console.log(
      `Updating entity [${entityID}:${index}] %O with data: %O`,
      entity,
      patch
    );
    console.log("Update result:", list[index]);
    return list[index];
  };

  const deleteEntity = (list, id) => list?.filter((e) => e.id !== id) ?? [];

  const findTask = (id) => findEntity(tasks, id);

  const findCompletion = (task, id) => findEntity(task?.completions, id);

  const updateTask = (taskID, patch) => updateEntity(tasks, taskID, patch);

  const addCompletion = (taskID, completion) => {
    const task = findTask(taskID);
    const completions = task.completions ?? [];

    updateTask(taskID, {
      completions: [...completions, createCompletion(completion)],
    });

    return completion;
  };

  const deleteCompletion = (taskID, id) => {
    const task = findTask(taskID);
    return updateTask(taskID, {
      completions: deleteEntity(task?.completions, id),
    });
  };

  const findTab = (id) => findEntity(tabs, id);

  const updateTab = (tabID, patch) => updateEntity(tabs, tabID, patch);

  const createTab = (patch) => {
    const length = tabs.push({
      ...patch,
      id: (tabs[tabs.length - 1].id ?? -1) + 1,
    });

    return tabs[length - 1];
  };

  const updateOrCreateTab = (tabID, patch) => {
    const tab = updateTab(tabID, patch);

    if (tab) {
      return tab;
    } else {
      return createTab(patch);
    }
  };

  const deleteTab = (tabID) => {
    const tabIndex = tabs.findIndex((t) => t.id === tabID);
    return !!tabs.splice(tabIndex, 1).length;
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
      disableMock: useExternalSource,
      gateway: gatewayAPI,
      endpoints: {
        project: {
          path: "/project",
          async mock() {
            return {
              id: 1,
              label_config_line: config,
              tasks_count: tasks.length,
              instructions: "Hello world",
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
            return { tabs };
          },
        },
        updateTab: {
          path: "/project/tabs/:tabID",
          method: "post",
          async mock(url, urlParams, request) {
            return {
              tab: updateOrCreateTab(urlParams.tabID, request.body),
            };
          },
        },
        deleteTab: {
          path: "/project/tabs/:tabID",
          method: "delete",
          async mock(url, urlParams, request) {
            return {
              OK: deleteTab(urlParams.tabID),
            };
          },
        },

        tasks: {
          path: "/project/tabs/:tabID/tasks",
          mock(url, urlParams) {
            const { page = 1, page_size = 500 } = urlParams;
            const offset = (page - 1) * page_size;

            return {
              tasks: tasks.slice(offset, offset + page_size),
              total: tasks.length,
            };
          },
        },
        annotations: {
          path: "/project/tabs/:tabID/annotations",
          mock() {
            return {
              annotations: annotations,
              total: annotations.length,
            };
          },
        },

        task: {
          path: "/tasks/:taskID",
          mock(url, urlParams) {
            const { taskID } = urlParams;
            return tasks.find((t) => t.id === taskID);
          },
        },
        skipTask: {
          path: "/tasks/:taskID/completions?was_cancelled=1",
          mock(url, urlParams, request) {
            const completion = addCompletion(urlParams.taskID, {
              ...request.body,
              skipped: true,
            });

            return { id: completion.id };
          },
        },
        nextTask: {
          path: "/project/next",
          mock() {
            const [min, max] = [0, tasks.length - 1];
            const index = Math.floor(Math.random() * (max - min + 1)) + min;
            return tasks[index];
          },
        },

        completion: "/tasks/:taskID/completions/:id",
        submitCompletion: {
          path: "/tasks/:taskID/completions",
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          mock(url, urlParams, request) {
            const completion = addCompletion(urlParams.taskID, request.body);

            return { id: completion.id };
          },
        },
        updateCompletion: {
          path: "/completions/:completionID",
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          mock(url, urlParams, request) {
            const { taskID, completionID } = urlParams;
            const completion = findCompletion(findTask(taskID), completionID);

            if (completion) {
              updateCompletion(completion, request.body);
            }

            return { OK: true };
          },
        },
        deleteCompletion: {
          path: "/completions/:completionID",
          method: "delete",
          mock(url, urlParams, request) {
            return deleteCompletion(urlParams.taskID, urlParams.completionID);
          },
        },
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
    ...(useExternalSource
      ? {}
      : {
          table: {
            hiddenColumns: {
              explore: ["tasks:data", "tasks:extra", "tasks:updated_at"],
            },
            visibleColumns: {
              labeling: [
                "tasks:id",
                "tasks:was_cancelled",
                "annotations:id",
                "annotations:task_id",
              ],
            },
          },
        }),
  });

  datamanager.on("submitCompletion", (...args) =>
    console.log("submitCompletion", args)
  );

  datamanager.on("updateCompletion", (...args) =>
    console.log("updateCompletion", args)
  );
};
