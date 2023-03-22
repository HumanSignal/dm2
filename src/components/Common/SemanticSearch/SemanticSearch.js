import React, { useState } from "react";
import { useEffect } from "react";
import { Block, Elem } from "../../../utils/bem";
import Input from "../Input/Input";
import { Button } from "../Button/Button";
import { RiFilter3Line, RiInformationLine } from "react-icons/ri";
import { FaTimes } from "react-icons/fa";
import "./SemanticSearch.styl";
import { Tooltip } from "../Tooltip/Tooltip";
import { inject, observer } from "mobx-react";
import { Dropdown } from "../Dropdown/DropdownComponent";

const injector = inject(({ store }) => ({
  store,
}));

export const SemanticSearch = injector(observer(({
  value,
  type,
  onChange,
  onSubmit,
  placeholder,
  schema,
  style,
  size,
  store,
}) => {
  const inputRef = React.useRef();
  const [currentValue, setCurrentValue] = useState();
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(100);
  const updateValue = (value) => {
    setCurrentValue(value);
    onChange?.(value);
  };
  const submitHandler = (e) => {
    e.preventDefault();
    console.log("submitHandler", currentValue);
    onSubmit?.(currentValue);
  };
  const onChangeHandler = () => {
    const value = inputRef.current?.value ?? inputRef.current?.input?.value;

    updateValue(value);
  };
  const clearHandler = () => {
    const value = "";

    updateValue(value);
  };
  const SemanticSearchDropdown = (() => {
    const fromChangeHandler = (e) => {
      console.log(e);
      setFrom(50);
    };
    const toChangeHandler = (e) => {
      console.log(e);
      setTo(100);
    };

    return (
      <Block name='searchDropdown'>
        {/* <Elem name='slider'>slider placeholder</Elem> */}
        <Elem name=''>
          <Elem name=''>Similarity Range 
            <Tooltip title="Filter results by degree of similarity">
              <RiInformationLine />
            </Tooltip>
          </Elem>
          <Elem name='controls'>
            <Input value={`${from}%`} onChange={fromChangeHandler}/>
            to
            <Input value={`${to}%`} onChange={toChangeHandler}/>
          </Elem>
        </Elem>
      </Block>
    );
  });

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  return (
    <Block tag="form" onSubmit={submitHandler} name='semanticSearch'>
      <Tooltip title="Search using natural language">
        <>
          <Elem name='container'>
            <Elem name='input'
              tag={Input}
              size={size ?? "medium"}
              type={type}
              value={currentValue ?? ""}
              ref={inputRef}
              placeholder={placeholder ?? `Search ${store?._sdk?.type === "DE" ? 'dataset' : 'project'}`}
              onChange={onChangeHandler}
              style={style}
              {...(schema ?? {})}
            />
            <Elem name="controls">
              {!!currentValue?.length && (
                <Elem name='icon' mod={{ delete: true }} onClick={clearHandler}>
                  <FaTimes />
                </Elem>
              )}
              <Dropdown.Trigger
                content={<SemanticSearchDropdown />}
              >
                <Elem name='icon' mod={{ filter: true }}>
                  <RiFilter3Line />
                </Elem>
              </Dropdown.Trigger>
            </Elem>
          </Elem>
          <Elem tag={Button} name='button' look="primary">Search</Elem>
        </>
      </Tooltip>
    </Block>
  );
}));
