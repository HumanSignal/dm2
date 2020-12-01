import React from "react";

export const ImageCell = (column) => (
  <img
    key={column.value}
    src={column.value}
    alt={column.value}
    style={{ maxHeight: "100%", objectFit: "contain", borderRadius: 3 }}
  />
);

ImageCell.style = {
  width: 40,
  justifyContent: "center",
};
