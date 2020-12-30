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

export const DateTimeInput = ({ value, range, time, onChange }) => {
  const onValueChange = React.useCallback(
    (selectedDate) => {
      let value;
      if (Array.isArray(selectedDate)) {
        const [min, max] = selectedDate.map((d) => d.toISOString());
        value = { min, max };
      } else {
        value = selectedDate?.toISOString();
      }

      onChange(value);
    },
    [onChange]
  );

  const dateValue = React.useMemo(() => {
    if (range) {
      const { min, max } = value ?? {};
      return [min, max].map((d) => (d ? moment(d) : undefined));
    } else {
      return value ? moment(value) : undefined;
    }
  }, [range, value]);

  const DateComponent = range ? DatePicker.RangePicker : DatePicker;

  return (
    <Picker>
      {({ className }) => (
        <DateComponent
          size="small"
          value={dateValue}
          dropdownClassName={className}
          showTime={time === true}
          style={{ flex: 1 }}
          onChange={onValueChange}
        />
      )}
    </Picker>
  );
};

export const DateFields = (extraProps) => {
  return [
    {
      key: "equal",
      label: "is at",
      valueType: "single",
      input: (props) => <DateTimeInput {...props} {...(extraProps ?? {})} />,
    },
    {
      key: "not_equal",
      label: "not at",
      valueType: "single",
      input: (props) => <DateTimeInput {...props} {...(extraProps ?? {})} />,
    },
    {
      key: "less",
      label: "is before",
      valueType: "single",
      input: (props) => <DateTimeInput {...props} {...(extraProps ?? {})} />,
    },
    {
      key: "greater",
      label: "is after",
      valueType: "single",
      input: (props) => <DateTimeInput {...props} {...(extraProps ?? {})} />,
    },
    {
      key: "in",
      label: "is between",
      valueType: "range",
      input: (props) => (
        <DateTimeInput range {...props} {...(extraProps ?? {})} />
      ),
    },
    {
      key: "not_in",
      label: "not between",
      valueType: "range",
      input: (props) => (
        <DateTimeInput range {...props} {...(extraProps ?? {})} />
      ),
    },
  ];
};

export const DateFilter = [...DateFields()];
