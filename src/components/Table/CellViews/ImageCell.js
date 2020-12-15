import React from "react";

export const ImageCell = (column) => (
  <img
    key={column.value}
    src={column.value}
    alt="Data"
    style={{
      maxHeight: "100%",
      maxWidth: "100px",
      objectFit: "contain",
      borderRadius: 3,
    }}
  />
);

ImageCell.style = {
  minWidth: 150,
  maxWidth: 150,
  justifyContent: "center",
};
