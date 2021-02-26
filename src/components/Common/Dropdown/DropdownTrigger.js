import React from "react";
import { cn } from "../../../utils/bem";
import { Dropdown } from "./DropdownComponent";
import { DropdownContext } from "./DropdownContext";

export const DropdownTrigger = ({
  tag,
  children,
  dropdown,
  content,
  closeOnClickOutside = true,
  ...props
}) => {
  if (children.length > 2)
    throw new Error("Trigger can't contain more that one child and a dropdown");
  const dropdownRef = dropdown ?? React.useRef();
  const triggerEL = React.Children.only(children);
  const [childset] = React.useState(new Set());

  /** @type {import('react').RefObject<HTMLElement>} */
  const triggerRef = triggerEL.props.ref ?? React.useRef();
  const parentDropdown = React.useContext(DropdownContext);

  const targetIsInsideDropdown = React.useCallback(
    (target) => {
      const triggerClicked = triggerRef.current?.contains?.(target);
      const dropdownClicked = dropdownRef.current?.dropdown?.contains?.(target);
      const childDropdownClicked = Array.from(childset).reduce((res, child) => {
        return res || child.hasTarget(target);
      }, false);

      return triggerClicked || dropdownClicked || childDropdownClicked;
    },
    [triggerRef, dropdownRef]
  );

  const handleClick = React.useCallback(
    (e) => {
      if (!closeOnClickOutside) return;
      if (targetIsInsideDropdown(e.target)) return;

      dropdownRef.current?.close?.();
    },
    [closeOnClickOutside, targetIsInsideDropdown]
  );

  const handleToggle = React.useCallback(
    (e) => {
      const inDropdown = dropdownRef.current?.dropdown?.contains?.(e.target);

      if (inDropdown) e.stopPropagation();
      else dropdownRef?.current?.toggle();
    },
    [dropdownRef]
  );

  const triggerClone = React.cloneElement(triggerEL, {
    ...triggerEL.props,
    tag,
    key: "dd-trigger",
    ref: triggerRef,
    className: cn("dropdown").elem("trigger").mix(props.className),
    onClickCapture: triggerEL.props?.onClick ? null : handleToggle,
  });

  const dropdownClone = content ? (
    <Dropdown {...props} ref={dropdownRef}>
      {content}
    </Dropdown>
  ) : null;

  React.useEffect(() => {
    document.addEventListener("click", handleClick, { capture: true });
    return () =>
      document.removeEventListener("click", handleClick, { capture: true });
  }, [handleClick]);

  const contextValue = React.useMemo(
    () => ({
      triggerRef,
      dropdown: dropdownRef,
      hasTarget: targetIsInsideDropdown,
      addChild: (child) => childset.add(child),
      removeChild: (child) => childset.delete(child),
    }),
    [triggerRef, dropdownRef]
  );

  React.useEffect(() => {
    if (!parentDropdown) return;

    parentDropdown.addChild(contextValue);
    return () => parentDropdown.removeChild(contextValue);
  }, []);

  return (
    <DropdownContext.Provider value={contextValue}>
      {triggerClone}
      {dropdownClone}
    </DropdownContext.Provider>
  );
};
