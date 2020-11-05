const columns = (tasks, data = {}, extra = {}) => [
  {
    id: "id",
    title: "ID",
    type: "Number",
    schema: {
      min: Math.min(...tasks.map((t) => t.id)),
      max: Math.max(...tasks.map((t) => t.id)),
    },
  },
  {
    id: "agreement",
    title: "Agreement",
    type: "Number",
    schema: {
      min: 0,
      max: 1,
    },
  },
  {
    id: "finished",
    title: "Finished",
    type: "Boolean",
  },
  {
    id: "collaborator",
    title: "Collaborators",
    type: "List",
    schema: {
      items: [
        { color: "cyan", value: "ns@heartex.ai", title: "Nick Skriabin" },
        { color: "magenta", value: "mt@heartex.ai", title: "Max Tkachenko" },
        { color: "purple", value: "mm@heartex.ai", title: "Michail Maluyk" },
        { color: "green", value: "an@heartex.ai", title: "Andrew" },
        { color: "blue", value: "nick@heartex.ai", title: "Nick" },
      ],
    },
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
  {
    id: "data",
    title: "Data",
    type: "List",
    children: Object.keys(data),
  },
  {
    id: "extra",
    title: "Extra",
    type: "List",
    children: Object.keys(extra),
  },
  ...Object.keys(data).map((key) => ({
    id: key,
    title: key.replace(/^\$/, ""),
    parent: "data",
    type: "Image",
  })),
  ...Object.keys(extra).map((key) => ({
    id: key,
    title: key.replace(/^\$/, ""),
    parent: "extra",
    type: "String",
  })),
];

export default columns;
