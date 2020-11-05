import { DatePicker } from "antd";
import React from "react";

export const DateTimeInput = ({ range, onChange }) => {
  const props = {
    size: "small",
    onChange(value) {
      console.log(value);
    },
    style: {
      flex: 1,
    },
  };
  return range ? (
    <DatePicker.RangePicker {...props} />
  ) : (
    <DatePicker {...props} />
  );
};

export const DateFields = (extraProps) => {
  return [
    {
      key: "equal",
      label: "is at",
      valueType: "single",
      input: (props) => <DateTimeInput {...props} />,
    },
    {
      key: "not_equal",
      label: "not at",
      valueType: "single",
      input: (props) => <DateTimeInput {...props} />,
    },
    {
      key: "less",
      label: "is before",
      valueType: "single",
      input: (props) => <DateTimeInput {...props} />,
    },
    {
      key: "greater",
      label: "is after",
      valueType: "single",
      input: (props) => <DateTimeInput {...props} />,
    },
    {
      key: "in",
      label: "is between",
      valueType: "range",
      input: (props) => <DateTimeInput range {...props} />,
    },
    {
      key: "not_in",
      label: "not between",
      valueType: "range",
      input: (props) => <DateTimeInput range {...props} />,
    },
  ];
};

export const DateFilter = [...DateFields()];
