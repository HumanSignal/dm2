import React, { useState } from "react";
import { useEffect } from "react";
import { Block, Elem } from "../../../utils/bem";
import Input from "../Input/Input";
import { Button } from "../Button/Button";
import { FaSearch } from "react-icons/fa";
import { RiFilter3Line } from "react-icons/ri";
import "./SemanticSearch.styl";

export const SemanticSearch = ({
  value,
  type,
  onChange,
  onSubmit,
  placeholder,
  schema,
  style,
  size,
}) => {
  const inputRef = React.useRef();
  const [currentValue, setCurrentValue] = useState();
  const submitHandler = (e) => {
    e.preventDefault();
    console.log("submitHandler", currentValue);
    onSubmit?.(currentValue);
  };
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
    <Block tag="form" onSubmit={submitHandler} name='semanticSearch'>
      <Elem name='container'>
        <Elem tag={FaSearch} name='icon' mod={{ prefix: true }} />
        <Elem name='input'
          tag={Input}
          size={size ?? "medium"}
          type={type}
          value={currentValue ?? ""}
          ref={inputRef}
          placeholder={placeholder ?? "Semantic search"}
          onChange={onChangeHandler}
          style={style}
          {...(schema ?? {})}
        />
        <Elem tag={RiFilter3Line} name='icon' mod={{ filter: true }} />
      </Elem>
      <Elem tag={Button} name='button' look="primary">Search</Elem>
    </Block>
  );
};
