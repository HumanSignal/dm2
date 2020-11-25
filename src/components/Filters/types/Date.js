import { DatePicker } from "antd";
import moment from "moment";
import React from "react";
import styled, { css } from "styled-components";

const cssOverride = css`
  th,
  td {
    padding: 3px 0 !important;
    border: none !important;
  }
`;

const StyleWrapper = ({ children, className }) => {
  return children({ className });
};

const Picker = styled(StyleWrapper)`
  ${cssOverride}
`;

export const DateTimeInput = ({ value, range, onChange }) => {
  const props = {
    size: "small",
    onChange(value) {
      if (Array.isArray(value)) {
        const [min, max] = value.map((d) => d.toISOString());
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

  return (
    <Picker>
      {({ className }) =>
        range ? (
          <DatePicker.RangePicker
            {...props}
            value={dateValue}
            dropdownClassName={className}
          />
        ) : (
          <DatePicker
            {...props}
            value={dateValue}
            dropdownClassName={className}
          />
        )
      }
    </Picker>
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
