import {
  DefaultColumnFilter,
  SelectColumnFilter,
  SliderColumnFilter,
  NumberRangeColumnFilter,
  fuzzyTextFilterFn,
  filterGreaterThan,
} from "../components/Filters";

const formatter = new Intl.DateTimeFormat(undefined, {
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
});

const fields = {
  // tasks related fields
  id: {
    title: "ID",
    accessor: "id",
    filterClass: SliderColumnFilter,
    filterType: filterGreaterThan,
  },
  task_status: {
    id: "status",
    title: "Status",
    accessor: () => "",
    filterClass: SelectColumnFilter,
    filterType: "includes",
  },
  annotations: {
    id: "annotations",
    title: "Annotations",
    accessor: (t) =>
      t.completions ? t.completions.length + t.predictions.length : 0,
    Cell: ({ row: { original } }) =>
      original.completions
        ? `${original.completions.length} / ${original.predictions.length}`
        : ``,
  },

  // annotations related fields
  annotation_id: { title: "ID", accessor: "annotation_id" },
  task_id: { title: "Task", accessor: "task_id" },
  annotation_status: { title: "Status" },
  author: { title: "Author" },
  regions: { title: "Regions #", accessor: "result.length" },

  // general fields
  created: {
    title: "Created On",
    accessor: "created_at",
    Cell: ({ value }) => formatter.format(new Date(value)),
  },
  updated: { title: "Updated On" },
};

export const labelingFields = ["id", "task_status"];

function lookup(name) {
  return name in fields
    ? fields[name]
    : {
        id: name,
        title: name,
        accessor: (t) => t["data"][name],
        filterClass: DefaultColumnFilter,
        filterType: fuzzyTextFilterFn,
      };
}

export default lookup;
