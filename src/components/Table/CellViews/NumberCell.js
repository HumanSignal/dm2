export const NumberCell = (column) => column.value;

NumberCell.style = (col) => {
  const result = {
    width: 30,
    minWidth: 160,
    // maxWidth: 160,
  };

  if (/id/.test(col.id)) {
    Object.assign(result, {
      minWidth: 110,
      maxWidth: 110,
      justifyContent: "flex-end",
    });
  }

  return result;
};
