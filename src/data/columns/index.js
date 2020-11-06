import { annotationsColumns } from "./annotations";
import { tasksColumns } from "./tasks";

const columns = (tasks, data = {}, extra = {}) => [
  ...tasksColumns(tasks, data, extra),
  ...annotationsColumns(tasks, data, extra),
];

export default columns;
