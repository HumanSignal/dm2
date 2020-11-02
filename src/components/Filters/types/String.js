import { Input } from "antd";
import React from "react";
import { Common } from "./Common";

const BaseInput = ({ defaultValue, onChange, placeholder }) => {
  return (
    <Input
      type="text"
      placeholder={placeholder}
      defaultValue={defaultValue}
      onChange={onChange}
    />
  );
};

export const StringFilter = [
  {
    key: "contains",
    label: "=",
    input: (props) => <BaseInput {...props} />,
  },
  {
    key: "not_contains",
    label: "≠",
    input: (props) => <BaseInput {...props} />,
  },
  {
    key: "equal",
    label: "<",
    input: (props) => <BaseInput {...props} />,
  },
  {
    key: "not_equal",
    label: ">",
    input: (props) => <BaseInput {...props} />,
  },
  ...Common,
];
