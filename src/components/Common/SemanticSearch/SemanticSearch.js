import React, { useCallback, useState } from "react";
import { useEffect } from "react";
import { Block, Elem } from "../../../utils/bem";
import Input from "../Input/Input";
import { Button } from "../Button/Button";
import { RiFilter3Line, RiInformationLine } from "react-icons/ri";
import "./SemanticSearch.styl";
import { Tooltip } from "../Tooltip/Tooltip";
import { inject, observer } from "mobx-react";
import { Dropdown } from "../Dropdown/DropdownComponent";
import { clamp } from "../../../utils/helpers";
import { LSPlus } from "../../../assets/icons";

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
  const min = 0;
  const max = 100;
  const minDiff = 0;
  const numericRegex = /([\d.])*/g;
  const [from, setFrom] = useState(min);
  const [to, setTo] = useState(max);
  const updateValue = (value) => {
    setCurrentValue(value);
    onChange?.(value);
  };
  const submitHandler = useCallback((e) => {
    e.preventDefault();
    console.log("fire semanticSearch request", currentValue, from, to);
    onSubmit?.(currentValue, from, to);
  }, [currentValue, from, to]);
  const onChangeHandler = () => {
    const value = inputRef.current?.value ?? inputRef.current?.input?.value;

    updateValue(value);
  };
  const clearHandler = () => {
    const value = "";

    updateValue(value);
  };
  const SemanticSearchDropdown = (() => {
    const fromChangeHandler = useCallback((e) => {
      const val = e?.target?.value;
      const newVal = Number(val?.match( numericRegex ).join(''));

      setFrom(clamp(newVal, min, to - minDiff));
    }, [min, minDiff, to]);
    const toChangeHandler = useCallback((e) => {
      const val = e?.target?.value;
      const newVal = Number(val?.match( numericRegex ).join(''));

      setTo(clamp(newVal, from + minDiff, max));
    }, [from, max, minDiff]);

    return (
      <Block name='searchDropdown'>
        {/* <Elem name='slider'>slider placeholder</Elem> */}
        <Elem name='container'>
          <Elem name='description'>Similarity Range 
            <Tooltip title="Filter results by degree of similarity">
              <Elem name='icon'>
                <RiInformationLine />
              </Elem>
            </Tooltip>
          </Elem>
          <Elem name='controls'>
            <Input value={`${from}%`} min={min} max={max} onChange={fromChangeHandler}/>
            to
            <Input value={`${to}%`} min={min} max={max} onChange={toChangeHandler}/>
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
        <Elem name='tooltipWrapper'>
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
                  <LSPlus />
                </Elem>
              )}
              <Dropdown.Trigger
                content={<SemanticSearchDropdown />}
              >
                <Elem name='icon' mod={{ filter: true }}>
                  <RiFilter3Line size={18} />
                </Elem>
              </Dropdown.Trigger>
            </Elem>
          </Elem>
          <Elem tag={Button} name='button' look="primary">Search</Elem>
        </Elem>
      </Tooltip>
    </Block>
  );
}));
