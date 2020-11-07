const tabs = [
  {
    id: 1,
    title: "Tab 1",
    hiddenColumns: null,
    filters: [
      // {
      //   filter: "tasks-agreement-filter",
      //   value: { min: 0.2, max: 0.5 },
      //   operator: "in",
      // },
      {
        filter: "tasks-id-filter",
        operator: "equal",
        value: 31,
      },
      {
        filter: "tasks-image-filter",
        operator: "equal",
        value: "\u0441\u0441",
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
