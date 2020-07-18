
import {
    DefaultColumnFilter,
    SelectColumnFilter,
    SliderColumnFilter,
    NumberRangeColumnFilter,
    fuzzyTextFilterFn,
    filterGreaterThan
} from "../components/Filters";

const formatter = new Intl.DateTimeFormat(undefined, { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });

const fields = {
    id: { title: "ID",
          accessor: 'id',
          filterClass: SliderColumnFilter,
          filterType: filterGreaterThan
        },
    task_status: {
        title: "Status",
        accessor: 'status',
        filterClass: SelectColumnFilter,
        filterType: 'includes'
    },
  annotations: {
    title: "Annotations",
    accessor: t => t.completions.length + t.predictions.length,
    Cell: ({ row: { original } }) => `${original.completions.length} / ${original.predictions.length}`,
  },
  annotation_status: { title: "Status" },
  created: { title: "Created On", accessor: 'created_at', Cell: ({ value }) => formatter.format(new Date(value)) },
  updated: { title: "Updated On" },
  author: { title: "Author" },
  regions: { title: "Regions #", accessor: 'result.length' },
};

export default fields;
