export const filters = (data) => [
  {
    field: "id",
    filter: "Number",
    value: (() => {
      const ids = data.map((d) => d.id);
      return { min: Math.min(...ids), max: Math.max(...ids) };
    })(),
  },
  {
    field: "status",
    filter: "List",
    value: [
      { value: "status1", label: "Status 1" },
      { value: "status2", label: "Status 2" },
      { value: "status3", label: "Status 3" },
    ],
  },
  {
    field: "created_at",
    filter: "Date",
    value: {
      min: new Date("2020-01-01"),
      max: new Date("2020-12-31"),
    },
  },
];
