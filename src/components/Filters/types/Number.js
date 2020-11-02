import { Input } from "antd";
import React from "react";
import { Common } from "./Common";

const BaseInput = ({ defaultValue, onChange, placeholder, schema, style }) => {
  return (
    <Input
      type="number"
      placeholder={placeholder}
      defaultValue={defaultValue}
      onChange={(e) => onChange(e, Number(e.target.value))}
      style={{
        width: "100%",
        ...(style ?? {}),
      }}
      {...(schema ?? {})}
    />
  );
};

const RangeInput = ({ schema, value, onChange }) => {
  const minmax = { ...value };

  const onChangeMin = (e, value) => {
    minmax.min = value;
    onChange(e, { ...minmax });
  };

  const onChangeMax = (e, value) => {
    minmax.max = value;
    onChange(e, { ...minmax });
  };

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <BaseInput
        placeholder="Min"
        defaultValue={value?.min}
        onChange={onChangeMin}
        schema={schema}
        style={{ width: 80 }}
      />
      <span style={{ padding: "0 10px" }}>and</span>
      <BaseInput
        placeholder="Max"
        defaultValue={value?.max}
        onChange={onChangeMax}
        schema={schema}
        style={{ width: 80 }}
      />
    </div>
  );
};

export const NumberFilter = [
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
    key: "in",
    label: "is between",
    input: (props) => <RangeInput {...props} />,
  },
  {
    key: "not_in",
    label: "not between",
    input: (props) => <RangeInput {...props} />,
  },
  ...Common,
];
