import { format, isValid } from "date-fns";
import React from "react";

export const DateTimeCell = (column) => {
  const date = new Date();
  const dateFormat = "MMM DD yyyy, HH:mm:ss";
  return (
    <div style={{ whiteSpace: "nowrap" }}>
      {isValid(date) ? format(column.value, dateFormat) : ""}
    </div>
  );
};
