import React, { useState } from "react";
import { useEffect } from "react";
import Input from "../Input/Input";

export const SemanticSearch = ({
  value,
  type,
  onChange,
  placeholder,
  schema,
  style,
  size,
}) => {
  const inputRef = React.useRef();
  const [currentValue, setCurrentValue] = useState();
  const onChangeHandler = () => {
    const value = inputRef.current?.value ?? inputRef.current?.input?.value;

    console.log("onChangeHandler", value);
    setCurrentValue(value);
    onChange?.(value);
  };

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  return (
    <Input
      size={size ?? "medium"}
      type={type}
      value={currentValue ?? ""}
      ref={inputRef}
      placeholder={placeholder ?? "Semantic search"}
      onChange={onChangeHandler}
      style={style}
      {...(schema ?? {})}
    />
  );
};
