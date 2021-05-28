import React from "react";
import { FilterDropdown } from "../FilterDropdown";

const VariantSelect = ({ filter, schema, onChange, multiple, value }) => {
  const { items } = schema;

  const selected = multiple
    ? value && value.length
      ? value
      : undefined
    : value;

  const FilterItem = filter.cellView?.FilterItem;

  return (
    <FilterDropdown
      items={items}
      value={value}
      multiple={multiple}
      optionRender={FilterItem}
      outputFormat={(value) => {
        console.log('changed', {value});
        return { items: [].concat(value) };
      }}
      onChange={(value) => onChange(value)}
    />
  );
};

export const ListFilter = [
  {
    key: "contains",
    label: "any of...",
    valueType: "list",
    input: (props) => <VariantSelect {...props} multiple/>,
  },
  {
    key: "not_contains",
    label: "none of...",
    valueType: "list",
    input: (props) => <VariantSelect {...props} multiple/>,
  },
];
