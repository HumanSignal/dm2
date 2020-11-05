import { CaretDownOutlined } from "@ant-design/icons";
import { Select, Tag } from "antd";
import React from "react";

const TagRender = (items) => ({ label, ...rest }) => {
  const color = items.find((el) => el.value === rest.value)?.color;
  return (
    <Tag color={color ?? "#000"} {...rest}>
      <div className="ant-tag-text">{label}</div>
    </Tag>
  );
};

export const FilterDropdown = ({
  placeholder,
  defaultValue,
  items,
  style,
  dropdownWidth,
  disabled,
  onChange,
  multiple,
  value,
}) => {
  return (
    <Select
      mode={multiple ? "multiple" : undefined}
      placeholder={placeholder}
      defaultValue={defaultValue}
      value={value}
      tagRender={TagRender(items)}
      bordered={false}
      style={{
        fontSize: 12,
        width: "100%",
        backgroundColor: disabled ? "none" : "#fafafa",
        ...(multiple ? { padding: 0 } : {}),
        ...(style ?? {}),
      }}
      dropdownStyle={{ minWidth: dropdownWidth ?? 130 }}
      onChange={onChange}
      disabled={disabled}
      size="small"
      suffixIcon={<CaretDownOutlined style={{ pointerEvents: "none" }} />}
      listItemHeight={20}
      listHeight={600}
    >
      {items.map((item) => {
        const value = item.value ?? item;
        const label = item.label ?? item.title ?? value;
        return (
          <Select.Option
            key={value}
            value={value}
            style={{ fontSize: 12 }}
            title={label}
          >
            {label}
          </Select.Option>
        );
      })}
    </Select>
  );
};
