import { DatePicker } from "antd";
import moment from "moment";
import React from "react";

export const DateTimeInput = ({ value, range, onChange }) => {
  const props = {
    size: "small",
    onChange(value) {
      if (Array.isArray(value)) {
        onChange({
          min: value[0].toISOString(),
          max: value[1].toISOString(),
        });
      } else {
        onChange(value.toISOString());
      }
    },
    style: {
      flex: 1,
    },
  };

  return range ? (
    <DatePicker.RangePicker {...props} value={moment(value)} />
  ) : (
    <DatePicker {...props} value={moment(value)} />
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
