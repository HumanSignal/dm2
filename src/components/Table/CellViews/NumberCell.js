export const NumberCell = (column) => column.value;

Object.assign(NumberCell, {
  constraints: (col) =>
    /id|has_cancelled/.test(col.id)
      ? {
          minWidth: 50,
          maxWidth: 50,
          width: 50,
        }
      : {},
});
