import React from "react";

export const TextDataGroup = ({ value }) => {
  return (
    <div style={{ height: TextDataGroup.height, overflow: "hidden" }}>
      {value}
    </div>
  );
};

TextDataGroup.height = 50;
