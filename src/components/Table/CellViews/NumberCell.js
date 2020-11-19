export const NumberCell = (column) => column.value;

Object.assign(NumberCell, {
  constraints: (col) =>
    /id|has_cancelled/.test(col.id)
      ? {
          minWidth: 30,
          maxWidth: 30,
          width: 30,
        }
      : {},
});
