import React from "react";
import { FilterDropdown } from "../FilterDropdown";

export const VariantSelect = ({ filter, schema, onChange, multiple, value }) => {
  const { items } = schema;

  const selectedValue = (() => {
    if (!multiple) {
      return Array.isArray(value) ? value[0] : value;
    } else {
      return Array.isArray(value) ? value : value ?? [];
    }
  })();

  const FilterItem = filter.cellView?.FilterItem;

  return (
    <FilterDropdown
      items={items}
      value={selectedValue}
      multiple={multiple}
      optionRender={FilterItem}
      outputFormat={multiple ? (value) => {
        return value ? [].concat(value) : [];
      } : undefined}
      onChange={(value) => onChange(value)}
    />
  );
};

export const ListFilter = [
  {
    key: "equal",
    label: "is...",
    valueType: "list",
    input: (props) => <VariantSelect {...props}/>,
  },
  {
    key: "not_equal",
    label: "is not...",
    valueType: "list",
    input: (props) => <VariantSelect {...props}/>,
  },
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
