export const DateTimeCell = (column) => {
  return column.value ? new Date(column.value).toISOString() : "";
};
