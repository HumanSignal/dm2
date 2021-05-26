import React from "react";
import { FilterDropdown } from "../FilterDropdown";

const VariantSelect = ({ schema, onChange, multiple, value }) => {
  const { items } = schema;

  const selected = multiple
    ? value && value.length
      ? value
      : undefined
    : value;

  return (
    <FilterDropdown
      items={items}
      value={selected}
      multiple={multiple}
      onChange={(value) => onChange(value)}
    />
  );
};

export const ListFilter = [
  {
    key: "equal",
    label: "is...",
    valueType: "single",
    input: (props) => <VariantSelect {...props} />,
  },
  {
    key: "not_equal",
    label: "is not...",
    valueType: "single",
    input: (props) => <VariantSelect {...props} />,
  },
  {
    key: "in",
    label: "any of...",
    valueType: "list",
    input: (props) => <VariantSelect {...props} multiple/>,
  },
  {
    key: "not_in",
    label: "none of...",
    valueType: "list",
    input: (props) => <VariantSelect {...props} multiple/>,
  },
];
