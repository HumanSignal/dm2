import React from "react";

export const TextDataGroup = ({ value }) => {
  return (
    <div
      style={{ padding: 5, height: TextDataGroup.height, overflow: "hidden" }}
    >
      {value}
    </div>
  );
};

TextDataGroup.height = 77;
