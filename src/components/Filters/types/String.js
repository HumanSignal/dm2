import React from "react";
import { FilterInput } from "../FilterInput";

const BaseInput = ({ defaultValue, onChange, placeholder }) => {
  return (
    <FilterInput
      type="text"
      style={{ fontSize: 14 }}
      placeholder={placeholder}
      defaultValue={defaultValue}
      onChange={(e) => onChange(e, e.target.value)}
    />
  );
};

export const StringFilter = [
  {
    key: "contains",
    label: "contains...",
    valueType: "single",
    input: (props) => <BaseInput {...props} />,
  },
  {
    key: "not_contains",
    label: "not contains...",
    valueType: "single",
    input: (props) => <BaseInput {...props} />,
  },
  {
    key: "equal",
    label: "equal...",
    valueType: "single",
    input: (props) => <BaseInput {...props} />,
  },
  {
    key: "not_equal",
    label: "not equal...",
    valueType: "single",
    input: (props) => <BaseInput {...props} />,
  },
];