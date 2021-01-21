import { Input } from "antd";
import React from "react";

export const FilterInput = ({
  value,
  type,
  onChange,
  placeholder,
  schema,
  style,
}) => {
  const inputRef = React.useRef();
  const onChangeHandler = (e) => {
    onChange(inputRef.current.input.value);
  };

  return (
    <Input
      size="small"
      type={type}
      value={value}
      ref={inputRef}
      placeholder={placeholder}
      onChange={onChangeHandler}
      style={{
        fontSize: 12,
        height: 24,
        minWidth: 60,
        flex: 1,
        ...(style ?? {}),
      }}
      {...(schema ?? {})}
    />
  );
};
