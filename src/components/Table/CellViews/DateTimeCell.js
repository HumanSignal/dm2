import moment from "moment";
import React from "react";

export const DateTimeCell = (column) => {
  return (
    <div style={{ whiteSpace: "nowrap" }}>
      {column.value ? moment(column.value).format("MMM DD yyyy, HH:mm:ss") : ""}
    </div>
  );
};
