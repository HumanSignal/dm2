import React from "react";

export const StringCell = (column) => {
  return (
    <div
      style={{
        maxHeight: "100%",
        overflow: "hidden",
        fontSize: 12,
        lineHeight: "16px",
      }}
    >
      {column.value}
    </div>
  );
};
