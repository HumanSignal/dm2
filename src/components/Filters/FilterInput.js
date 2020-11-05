import { Input } from "antd";
import React from "react";

export const FilterInput = ({
  value,
  type,
  onChange,
  placeholder,
  schema,
  style,
}) => {
  return (
    <Input
      size="small"
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e, Number(e.target.value))}
      style={{
        fontSize: 12,
        height: 24,
        minWidth: 60,
        flex: 1,
        ...(style ?? {}),
      }}
      {...(schema ?? {})}
    />
  );
};
