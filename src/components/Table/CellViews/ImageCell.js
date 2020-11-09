import React from "react";

export const ImageCell = (column) => {
  return (
    <div>
      <img
        src={column.value}
        alt={column.value}
        style={{ maxWidth: 100, maxHeight: 100, objectFit: "contain" }}
      />
    </div>
  );
};
