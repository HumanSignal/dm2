export const prepareColumns = (columns, hidden) => {
  return columns.filter((col) => {
    return !(hidden ?? []).includes(col.id);
  });
};

export const getProperty = (object, path) => {
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function("object", `return object.${path}`);
    return fn(object);
  } catch {
    return undefined;
  }
};

const resolveStyle = (col, decoration, cellView) => {
  let result = {};

  [cellView, decoration].forEach((item) => {
    const cellStyle = (item ?? {}).style;
    console.log({ item, cellStyle });

    if (cellStyle instanceof Function) {
      Object.assign(result, cellStyle(col) ?? {});
    } else {
      Object.assign(result, cellStyle ?? {});
    }
  });

  return result ?? {};
};

export const getStyle = (cellViews, col, decoration) => {
  const cellView = cellViews?.[col.type];
  const style = { width: 150 };

  Object.assign(style, resolveStyle(col, decoration, cellView));

  console.log(col.id, style);

  return style;
};
