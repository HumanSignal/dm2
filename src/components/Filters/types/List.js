import React from "react";
import { FilterDropdown } from "../FilterDropdown";

const VariantSelect = ({ schema, onChange, multiple, value }) => {
  const { items } = schema;

  const selected = value && value.length ? value : undefined;

  return (
    <FilterDropdown
      items={items}
      multiple={multiple}
      defaultValue={selected}
      onChange={(value) => onChange(undefined, value)}
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
    input: (props) => <VariantSelect {...props} multiple="true" />,
  },
  {
    key: "not_in",
    label: "none of...",
    valueType: "list",
    input: (props) => <VariantSelect {...props} multiple="true" />,
  },
];
