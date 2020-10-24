export const initDevApp = async (DataManager) => {
  console.log("Running in development");

  const data = Object.values(await import("./data/tasks.json"));

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
            return data.slice(offset, page_size);
          },
        },
        task: {
          path: "/task/:id",
          mock(url, request) {
            const { id } = request.data;
            return data.find((t) => t.id === id);
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
        cancel: "/cancel",
        projects: "/projects",
        next: "/next",
        expertInstructions: "/expert_instruction",
      },
    },
    labelStudio: {
      config: (await import("./data/config")).default,
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
