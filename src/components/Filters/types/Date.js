import { DatePicker } from "antd";
import moment from "moment";
import React from "react";

export const DateTimeInput = ({ value, range, onChange }) => {
  const props = {
    size: "small",
    onChange(value) {
      console.log(value);
      if (Array.isArray(value)) {
        const [min, max] = value.map((d) => d.toISOString());
        console.log({ min, max });
        onChange({ min, max });
      } else {
        onChange(value?.toISOString());
      }
    },
    style: {
      flex: 1,
    },
  };

  const dateValue = range
    ? [
        value?.min ? moment(value?.min) : undefined,
        value?.max ? moment(value?.max) : undefined,
      ]
    : value
    ? moment(value)
    : undefined;

  return range ? (
    <DatePicker.RangePicker {...props} value={dateValue} />
  ) : (
    <DatePicker {...props} value={dateValue} />
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
