const tabs = [
  {
    id: 1,
    title: "Tab 1",
    hiddenColumns: null,
    filters: [
      {
        filter: "agreement-filter",
        value: { min: 0.2, max: 0.5 },
        operator: "in",
      },
    ],
  },
  {
    id: 2,
    title: "Tab 2",
    hiddenColumns: null,
    filters: [],
  },
];

export default tabs;