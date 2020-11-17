import React from "react";

export const ImageCell = (column) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        borderRadius: 3,
      }}
    >
      <img
        src={column.value}
        alt={column.value}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
};

Object.assign(ImageCell, {
  constraints: {
    maxWidth: 30,
    minWidth: 30,
    width: 30,
  },
});
