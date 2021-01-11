import React from "react";

const valueToString = (value) => {
  if (typeof valye === "string") return value;

  try {
    return JSON.stringify(value);
  } catch {
    return value.toString();
  }
};

export const TextDataGroup = ({ value }) => {
  return (
    <div
      style={{ padding: 5, height: TextDataGroup.height, overflow: "hidden" }}
    >
      {valueToString(value)}
    </div>
  );
};

TextDataGroup.height = 77;
