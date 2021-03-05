import React, { useRef } from "react";
import { BemWithSpecifiContext } from "../../../utils/bem";
import { Dropdown } from "../Dropdown/Dropdown";
import "./Select.styl";

const SelectContext = React.createContext();
const { Block, Elem } = BemWithSpecifiContext();

const findSelectedChild = (children, value) => {
  return React.Children.toArray(children).reduce((res, child) => {
    if (res !== null) return res;
    if (child.type.displayName === "Select.Option") {
      if (child.props.value === value) res = child;
    } else if (child.type.displayName === "Select.OptGroup") {
      res = findSelectedChild(child.props.children, value);
    }
    return res;
  }, null);
};

export const Select = ({
  value,
  defaultValue,
  size,
  children,
  onChange,
  style,
}) => {
  const dropdown = useRef();
  const [currentValue, setCurrentValue] = React.useState(value);

  const context = {
    currentValue,
    setCurrentValue(value) {
      setCurrentValue(value);
      onChange?.(value);
      dropdown.current?.close();
    },
  };

  const selected = React.useMemo(() => {
    const foundChild = findSelectedChild(
      children,
      defaultValue ?? currentValue
    );
    const result = foundChild?.props?.children;
    return result ? React.cloneElement(<>{result}</>) : null;
  }, [currentValue, defaultValue]);

  React.useEffect(() => {
    if (value !== currentValue) {
      context.setCurrentValue(value);
    }
  }, [value]);

  return (
    <SelectContext.Provider value={context}>
      <Block name="select" mod={{ size }} style={style}>
        <Dropdown.Trigger ref={dropdown} style={{maxHeight: 280, overflow: 'auto'}} content={<Elem name="list">{children}</Elem>}>
          <Elem name="selected">
            <Elem name="value">{selected ?? "Select value"}</Elem>
            <Elem name="icon" />
          </Elem>
        </Dropdown.Trigger>
      </Block>
    </SelectContext.Provider>
  );
};
Select.displayName = "Select";

Select.Option = ({ value, children, style }) => {
  const { setCurrentValue, currentValue } = React.useContext(SelectContext);
  return (
    <Elem
      name="option"
      mod={{ selected: value === currentValue }}
      onClick={(e) => {
        e.stopPropagation();
        setCurrentValue(value);
      }}
      style={style}
    >
      {children}
    </Elem>
  );
};
Select.Option.displayName = "Select.Option";

Select.OptGroup = ({ label, children, style }) => {
  return (
    <Elem name="optgroup" style={style}>
      <Elem name="optgroup-label">{label}</Elem>
      <Elem name="optgroup-list">{children}</Elem>
    </Elem>
  );
};
Select.OptGroup.displayName = "Select.OptGroup";
