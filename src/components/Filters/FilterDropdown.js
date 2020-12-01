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

const renderOptGroup = ({ id, title, options }, optionRender) => {
  return (
    <Select.OptGroup key={id} label={title}>
      {options.map(renderSelectItem(optionRender))}
    </Select.OptGroup>
  );
};

const renderSelectItem = (optionRender) => (item) => {
  const value = item.value ?? item;
  const label = item.label ?? item.title ?? value;

  if (item.options) {
    return renderOptGroup(item, optionRender);
  }

  return (
    <Select.Option
      key={value}
      value={value}
      style={{ fontSize: 12 }}
      title={label}
    >
      {optionRender ? optionRender(item) : label}
    </Select.Option>
  );
};

export const FilterDropdown = ({
  placeholder,
  defaultValue,
  items,
  style,
  disabled,
  onChange,
  multiple,
  value,
  optionRender,
  dropdownClassName,
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
      dropdownStyle={{ minWidth: "fit-content" }}
      onChange={onChange}
      disabled={disabled}
      size="small"
      suffixIcon={<CaretDownOutlined style={{ pointerEvents: "none" }} />}
      listItemHeight={20}
      listHeight={600}
      dropdownClassName={dropdownClassName}
    >
      {items.map(renderSelectItem(optionRender))}
    </Select>
  );
};
