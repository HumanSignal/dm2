export const DateTimeCell = (column) => {
  return column.value ? new Date(column.value).toISOString() : "";
};

Object.assign(DateTimeCell, {
  constraints: {
    maxWidth: 50,
    minWidth: 50,
    width: 50,
  },
});
