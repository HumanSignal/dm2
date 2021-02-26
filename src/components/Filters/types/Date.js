import { DatePicker } from "antd";
import { isValid } from "date-fns";
import React from "react";

export const DateTimeInput = ({ value, range, time, onChange }) => {
  const onValueChange = React.useCallback(
    (selectedDate) => {
      let value;
      if (Array.isArray(selectedDate)) {
        const [min, max] = selectedDate
          .map((d) => new Date(d))
          .map((d) => (isValid(d) ? d.toISOString() : undefined));

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

      return [min, max]
        .map((d) => new Date(d))
        .map((d) => (isValid(d) ? d : undefined));
    } else {
      const date = new Date(value);
      return isValid(date) ? date : undefined;
    }
  }, [range, value]);

  return (
    <DatePicker
      size="small"
      value={dateValue}
      showTime={time === true}
      onChange={onValueChange}
    />
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
