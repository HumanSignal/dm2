import { Tag } from "antd";
import React from "react";

export const BooleanCell = (column) => {
  if (column.value === true) {
    return <Tag color="#80c70d">true</Tag>;
  } else if (column.value === false) {
    return <Tag color="#de3301">false</Tag>;
  }

  return null;
};
