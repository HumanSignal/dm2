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
      {typeof column.value === "string"
        ? column.value
        : JSON.stringify(column.value)}
    </div>
  );
};
