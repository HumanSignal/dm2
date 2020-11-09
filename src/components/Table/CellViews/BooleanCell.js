import { Tag } from "antd";
import React from "react";

export const BooleanCell = (column) => {
  return !!column.value ? (
    <Tag color="#80c70d" style={{ fontSize: 16 }}>
      true
    </Tag>
  ) : (
    <Tag color="#de3301" style={{ fontSize: 16 }}>
      false
    </Tag>
  );
};
