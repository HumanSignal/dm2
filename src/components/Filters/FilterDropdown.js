import { Select } from "antd";
import React from "react";

export const FilterDropdown = ({
  placeholder,
  defaultValue,
  items,
  width,
  dropdownWidth,
  onChange,
}) => {
  return (
    <Select
      placeholder={placeholder}
      defaultValue={defaultValue}
      style={{ width: width ?? 80, textAlign: "right" }}
      dropdownStyle={{ minWidth: dropdownWidth ?? 130 }}
      onChange={onChange}
    >
      {items.map((item) => (
        <Select.Option key={item.value} value={item.value}>
          {item.label}
        </Select.Option>
      ))}
    </Select>
  );
};
