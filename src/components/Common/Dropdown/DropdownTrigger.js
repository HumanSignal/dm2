import React from "react";
import { cn } from "../../../utils/bem";
import { Dropdown } from "./DropdownComponent";
import { DropdownContext } from "./DropdownContext";

export const DropdownTrigger = ({
  tagName,
  children,
  dropdown,
  content,
  closeOnClickOutside = true,
  ...props
}) => {
  if (children.length > 2)
    throw new Error("Trigger can't contain more that one child and a dropdown");
  /** @type {import('react').RefObject<HTMLElement>} */
  const dropdownRef = dropdown ?? React.useRef();
  const triggerEL = React.Children.only(children);

  /** @type {import('react').RefObject<HTMLElement>} */
  const triggerRef = triggerEL.props.ref ?? React.useRef();

  const handleClick = React.useCallback(
    (e) => {
      if (!closeOnClickOutside) return;

      const target = e.target;
      const triggerClicked = cn("dropdown").elem("trigger").closest(target);
      const dropdownClicked = dropdownRef.current.containt(target);

      if (!triggerClicked && !dropdownClicked) {
        dropdownRef.current?.close?.();
      }
    },
    [closeOnClickOutside, dropdownRef]
  );

  const handleToggle = React.useCallback(
    (e) => {
      console.log(e.target, dropdownRef.current);
      if (!cn("dropdown").closest(e.target)) {
        dropdownRef?.current?.toggle();
      }
    },
    [dropdownRef]
  );

  const triggerClone = React.cloneElement(triggerEL, {
    ...triggerEL.props,
    key: "dd-trigger",
    tagName,
    ref: triggerRef,
    className: cn("dropdown").elem("trigger").mix(props.className),
    onClick: triggerEL.props?.onClick || handleToggle,
  });

  console.log({ triggerClone });

  const dropdownClone = content ? (
    <Dropdown {...props} ref={dropdownRef}>
      {content}
    </Dropdown>
  ) : null;

  React.useEffect(() => {
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [closeOnClickOutside, handleClick]);

  return (
    <DropdownContext.Provider value={{ triggerRef }}>
      {triggerClone}
      {dropdownClone}
    </DropdownContext.Provider>
  );
};
