const columns = (data = {}, extra = {}) => [
  {
    id: "id",
    title: "ID",
    type: "Number",
  },
  {
    id: "agreement",
    title: "Agreement",
    type: "Number",
  },
  {
    id: "finished",
    title: "Finished",
    type: "Boolean",
  },
  {
    id: "created_at",
    title: "Created at",
    type: "Datetime",
  },
  {
    id: "updated_at",
    title: "Updated at",
    type: "Datetime",
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
    defaultHidden: true,
  })),
  ...Object.keys(extra).map((key) => ({
    id: key,
    title: key.replace(/^\$/, ""),
    parent: "extra",
    defaultHidden: true,
  })),
];

export default columns;
