import { Input } from "antd";
import React from "react";
import { Common } from "./Common";

const BaseInput = ({ defaultValue, onChange, placeholder }) => {
  return (
    <Input
      type="text"
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
    input: (props) => <BaseInput {...props} />,
  },
  {
    key: "not_contains",
    label: "not contains...",
    input: (props) => <BaseInput {...props} />,
  },
  {
    key: "equal",
    label: "equal...",
    input: (props) => <BaseInput {...props} />,
  },
  {
    key: "not_equal",
    label: "not equal...",
    input: (props) => <BaseInput {...props} />,
  },
  ...Common,
];
