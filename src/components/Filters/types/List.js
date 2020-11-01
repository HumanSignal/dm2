import { Select } from "antd";
import React from "react";
import { Common } from "./Common";

const VariantSelect = ({ variants, onChange }) => {
  return (
    <Select defaultValue={variants[0].value} onChange={onChange}>
      {variants.map((variant) => (
        <Select.Option key={variant.value} value={variant.value}>
          {variant.label}
        </Select.Option>
      ))}
    </Select>
  );
};

export const List = [
  {
    key: "equal",
    label: "is...",
    input: (props) => <VariantSelect {...props} />,
  },
  {
    key: "not_equal",
    label: "is not...",
    input: (props) => <VariantSelect {...props} />,
  },
  {
    key: "in",
    label: "any of...",
    input: (props) => <VariantSelect {...props} multiple="true" />,
  },
  {
    key: "not_in",
    label: "none of...",
    input: (props) => <VariantSelect {...props} multiple="true" />,
  },
  ...Common,
];
