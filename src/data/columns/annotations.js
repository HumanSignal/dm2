export const annotationsColumns = (tasks, data = {}, extra = {}) =>
  [
    {
      id: "id",
      title: "ID",
      type: "Number",
    },
    {
      id: "task",
      title: "Task ID",
      type: "Number",
    },
    {
      id: "created_at",
      title: "Created at",
      type: "Datetime",
      schema: {
        min: new Date(
          Math.min(...tasks.map((t) => new Date(t.created_at).getTime()))
        ).toISOString(),
        max: new Date(
          Math.max(...tasks.map((t) => new Date(t.created_at).getTime()))
        ).toISOString(),
      },
    },
    {
      id: "updated_at",
      title: "Updated at",
      type: "Datetime",
      schema: {
        min: new Date(
          Math.min(...tasks.map((t) => new Date(t.updated_at).getTime()))
        ).toISOString(),
        max: new Date(
          Math.max(...tasks.map((t) => new Date(t.updated_at).getTime()))
        ).toISOString(),
      },
    },
  ].map((c) => ({ ...c, target: "annotations" }));
