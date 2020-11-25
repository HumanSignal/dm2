import React from "react";

export const ImageCell = (column) => {
  return (
    <img
      src={column.value}
      alt={column.value}
      style={{ maxHeight: "100%", objectFit: "contain", borderRadius: 3 }}
    />
  );
};

Object.assign(ImageCell, {
  constraints: {
    maxWidth: 40,
    minWidth: 40,
    width: 40,
  },
});
