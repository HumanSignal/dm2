import { guidGenerator } from "./utils/random";

export const initDevApp = async (DataManager) => {
  console.log("Running in development");

  const { tasks, config } = await import("./data/image_bbox");

  // unlock objects for modification
  const data = tasks.map((d) => JSON.parse(JSON.stringify(d)));

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

            console.log({ offset, page_size });
            return {
              tasks: data.slice(offset, offset + page_size),
              total: data.length,
            };
          },
        },
        completions: {
          path: "/tasks/:taskId/completions",
          method: "post",
          mock(url, urlParams) {
            const { id } = urlParams;
            return data.find((t) => t.id === id)?.completions;
          },
        },
        task: {
          path: "/tasks/:taskID",
          mock(url, urlParams) {
            const { taskID } = urlParams;
            return data.find((t) => t.id === taskID);
          },
        },
        nextTask: {
          path: "/projects/:projectID/next",
          method: "get",
          mock() {
            const [min, max] = [0, data.length - 1];
            const index = Math.floor(Math.random() * (max - min + 1)) + min;
            return data[index];
          },
        },
        submitCompletion: {
          path: "/tasks/:taskID/completions",
          method: "post",
          headers: {
            ContentType: "application/json",
          },
          mock(url, urlParams, request) {
            const taskIndex = data.findIndex((t) => t.id === urlParams.taskID);

            const newCompletion = {
              ...request.body,
              id: guidGenerator(),
              updated_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              review_result: false,
              ground_truth: null,
              completed_by: 1,
            };

            const task = data[taskIndex];

            data[taskIndex] = {
              ...data[taskIndex],
              completions: [...(task.completions ?? []), newCompletion],
            };

            console.log(urlParams, request.body);
            return { id: newCompletion.id };
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
            const completion = data
              .find((t) => t.id === taskID)
              ?.completions?.find((c) => c.id === completionID);

            if (completion) {
              Object.assign(completion, {
                ...request.body,
                id: completion.id,
                updated_at: new Date().toISOString(),
              });
            }

            return {};
          },
        },
        project: {
          path: "/project",
          mock() {
            return {
              id: 1,
              label_config_line: config,
              tasks_count: data.length,
            };
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
