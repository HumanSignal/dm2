import React from "react";

const valueToString = (value) => {
  if (typeof value === "string") return value;

  try {
    return JSON.stringify(value);
  } catch {
    return value.toString();
  }
};

export const StringCell = ({ column, value }) => {
  return (
    <div
      style={{
        maxHeight: "100%",
        overflow: "hidden",
        fontSize: 12,
        lineHeight: "16px",
      }}
    >
      {valueToString(value)}
    </div>
  );
};
