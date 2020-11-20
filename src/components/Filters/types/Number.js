import { observer } from "mobx-react";
import React from "react";
import { FilterInput } from "../FilterInput";

const NumberInput = ({ onChange, ...rest }) => {
  console.log(rest);
  return (
    <FilterInput
      type="number"
      {...rest}
      onChange={(value) => onChange(value ? Number(value) : null)}
    />
  );
};

const RangeInput = observer(({ schema, value, onChange }) => {
  const min = value?.min;
  const max = value?.max;

  const onValueChange = (value) => {
    onChange(value);
  };

  const onChangeMin = (value) => {
    onValueChange({ min: value, max });
  };

  const onChangeMax = (value) => {
    onValueChange({ min, max: value });
  };

  return (
    <>
      <NumberInput
        placeholder="Min"
        value={min}
        onChange={onChangeMin}
        schema={schema}
        style={{ flex: 1 }}
      />
      <span style={{ padding: "0 10px" }}>and</span>
      <NumberInput
        placeholder="Max"
        value={max}
        onChange={onChangeMax}
        schema={schema}
        style={{ flex: 1 }}
      />
    </>
  );
});

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
