import React from "react";
import { cn } from "../../../utils/bem";
import "./RadioGroup.styl";

const RadioContext = React.createContext();

export const RadioGroup = ({ size, value, onChange, children }) => {
  const [currentValue, setCurrentValue] = React.useState(value);

  const onRadioChange = (e) => {
    setCurrentValue(e.target.value);
    onChange?.(e);
  };

  return (
    <RadioContext.Provider
      value={{
        value: currentValue,
        onChange: onRadioChange,
      }}
    >
      <div
        className={cn("radio-group").mod({ size })}
        onChange={() => console.log("change")}
      >
        <div className={cn("radio-group").elem("buttons")}>{children}</div>
      </div>
    </RadioContext.Provider>
  );
};

const RadioButton = ({ value, disabled, children }) => {
  const { onChange, value: currentValue } = React.useContext(RadioContext);
  const checked = value === currentValue;

  return (
    <label
      className={cn("radio-group").elem("button").mod({ checked, disabled })}
    >
      <input
        className={cn("radio-group").elem("input")}
        type="radio"
        value={value}
        checked={value === currentValue}
        onChange={onChange}
        disabled={disabled}
      />
      {children}
    </label>
  );
};

RadioGroup.Button = RadioButton;
