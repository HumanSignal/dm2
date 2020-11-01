import { Input } from "antd";
import React from "react";
import { Common } from "./Common";

const BaseInput = ({ defaultValue, onChange, placeholder }) => {
  return (
    <Input
      type="number"
      placeholder={placeholder}
      defaultValue={defaultValue}
      onChange={onChange}
    />
  );
};

export const Number = [
  {
    key: "equal",
    label: "=",
    input: (props) => <BaseInput {...props} />,
  },
  {
    key: "not_equal",
    label: "≠",
    input: (props) => <BaseInput {...props} />,
  },
  {
    key: "less",
    label: "<",
    input: (props) => <BaseInput {...props} />,
  },
  {
    key: "greater",
    label: ">",
    input: (props) => <BaseInput {...props} />,
  },
  {
    key: "less_or_equal",
    label: "≤",
    input: (props) => <BaseInput {...props} />,
  },
  {
    key: "greater_or_equal",
    label: "≥",
    input: (props) => <BaseInput {...props} />,
  },
  {
    key: "between",
    label: "is between",
    input: ({ defaultMin, defaultMax, onChange }) => {
      const minmax = { defaultMin, defaultMax };

      const onChangeMin = (value) => {
        minmax.defaultMin = value;
        onChange(...Object.values(minmax));
      };

      const onChangeMax = (value) => {
        minmax.defaultMax = value;
        onChange(...Object.values(minmax));
      };

      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <BaseInput
            placeholder="Min"
            defaultValue={defaultMin}
            onChange={onChangeMin}
          />
          <span style={{ padding: "0 10px" }}>and</span>
          <BaseInput
            placeholder="Max"
            defaultValue={defaultMax}
            onChange={onChangeMax}
          />
        </div>
      );
    },
  },
  ...Common,
];
