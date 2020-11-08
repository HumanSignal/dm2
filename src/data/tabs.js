const tabs = [
  {
    id: 1,
    title: "Tab 1",
    hiddenColumns: {
      explore: ["tasks:data.image", "tasks:extra", "tasks:created_at"],
      labeling: [],
    },
    filters: [
      // {
      //   filter: "tasks-agreement-filter",
      //   value: { min: 0.2, max: 0.5 },
      //   operator: "in",
      // },
      {
        filter: "filter:tasks:id",
        operator: "equal",
        value: 31,
      },
      {
        filter: "filter:tasks:data.image",
        operator: "equal",
        value: "\u0441\u0441",
      },
      {
        filter: "filter:tasks:finished",
        operator: "equal",
        value: true,
      },
    ],
    conjunction: "or",
  },
  {
    id: 2,
    title: "Tab 2",
    hiddenColumns: null,
    filters: [],
  },
];

export default tabs;
