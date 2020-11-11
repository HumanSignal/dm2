import React from "react";
import { FilterInput } from "../FilterInput";

const NumberInput = ({ onChange, ...rest }) => {
  return (
    <FilterInput
      type="number"
      {...rest}
      onChange={(value) => onChange(Number(value))}
    />
  );
};

const RangeInput = ({ schema, value, onChange }) => {
  const minmax = { min: undefined, max: undefined, ...value };

  const onValueChange = (e, value) => {
    if (value.min !== undefined && value.max !== undefined) {
      onChange(e, value);
    }
  };

  const onChangeMin = (e, value) => {
    minmax.min = value;
    onValueChange(e, { ...minmax });
  };

  const onChangeMax = (e, value) => {
    minmax.max = value;
    onValueChange(e, { ...minmax });
  };

  return (
    <>
      <NumberInput
        placeholder="Min"
        value={value?.min}
        onChange={onChangeMin}
        schema={schema}
        style={{ flex: 1 }}
      />
      <span style={{ padding: "0 10px" }}>and</span>
      <NumberInput
        placeholder="Max"
        value={value?.max}
        onChange={onChangeMax}
        schema={schema}
        style={{ flex: 1 }}
      />
    </>
  );
};

export const NumberFilter = [
  {
    key: "equal",
    label: "=",
    valueType: "single",
    input: (props) => <NumberInput {...props} />,
  },
  {
    key: "not_equal",
    label: "≠",
    valueType: "single",
    input: (props) => <NumberInput {...props} />,
  },
  {
    key: "less",
    label: "<",
    valueType: "single",
    input: (props) => <NumberInput {...props} />,
  },
  {
    key: "greater",
    label: ">",
    valueType: "single",
    input: (props) => <NumberInput {...props} />,
  },
  {
    key: "less_or_equal",
    label: "≤",
    valueType: "single",
    input: (props) => <NumberInput {...props} />,
  },
  {
    key: "greater_or_equal",
    label: "≥",
    valueType: "single",
    input: (props) => <NumberInput {...props} />,
  },
  {
    key: "in",
    label: "is between",
    valueType: "range",
    input: (props) => <RangeInput {...props} />,
  },
  {
    key: "not_in",
    label: "not between",
    valueType: "range",
    input: (props) => <RangeInput {...props} />,
  },
];
