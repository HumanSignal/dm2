export const NumberCell = (column) => column.value;

NumberCell.style = (col) =>
  /id|has_cancelled/.test(col.id)
    ? {
        width: 30,
        justifyContent: "center",
      }
    : {};
