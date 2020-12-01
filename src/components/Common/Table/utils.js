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

export const getStyle = (cellViews, col) => {
  const cellView = cellViews?.[col.type];
  const style = { width: 150 };

  if (cellView) {
    const { style: cellStyle } = cellView;

    if (cellStyle instanceof Function) {
      Object.assign(style, cellStyle(col));
    } else {
      Object.assign(style, cellStyle);
    }
  }

  return style;
};
