export const initDevApp = async (DataManager) => {
  console.log("Running in development");

  const task = await import("./data/image_bbox");
  const data = task.tasks;

  const datamanager = new DataManager({
    root: document.getElementById("app"),
    api: {
      gateway: "/api",
      endpoints: {
        tasks: {
          path: "/tasks",
          mock(url, request) {
            const { page, page_size } = request.data;
            const offset = (page - 1) * page_size;

            console.log({ offset, page_size });
            return {
              tasks: data.slice(offset, offset + page_size),
              total: data.length,
            };
          },
        },
        task: {
          path: "/task/:id",
          mock(url, request) {
            const { id } = request.data;
            return data.find((t) => t.id === id);
          },
        },
        next: {
          path: "/next",
          method: "get",
          mock() {
            const [min, max] = [0, data.length - 1];
            const index = Math.floor(Math.random() * (max - min + 1)) + min;
            return data[index];
          },
        },
        completions: {
          path: "/tasks/:id/completions",
          method: "post",
          mock(url, request) {
            const { id } = request.data;
            return data.find((t) => t.id === id)?.completions;
          },
        },
        submitCompletion: {
          path: "/tasks/:id/completions",
          method: "post",
          mock(url, request) {
            console.log(request.body);
          },
        },
        project: {
          path: "/project",
          mock() {
            return {
              label_config_line: task.config,
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
};
