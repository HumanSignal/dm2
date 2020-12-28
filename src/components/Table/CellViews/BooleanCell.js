import { Tag } from "antd";
import React from "react";

export const BooleanCell = (column) => {
  const boolValue = !!column.value;

  if (boolValue === true) {
    return <Tag color="#80c70d">true</Tag>;
  } else if (boolValue === false) {
    return <Tag color="#de3301">false</Tag>;
  }

  return null;
};
