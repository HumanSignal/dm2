import React from "react";
import { cn } from "../../../utils/bem";
import { DropdownContext } from "./DropdownContext";

export const DropdownTrigger = ({
  tagName,
  children,
  dropdown,
  closeOnClickOutside = true,
  ...props
}) => {
  /** @type {import('react').RefObject<HTMLElement>} */
  const externalRef = dropdown;
  const dropdownRef = React.useRef();

  const finalRef = React.useMemo(() => {
    return externalRef ?? dropdownRef;
  }, [externalRef, dropdownRef]);

  /** @type {import('react').RefObject<HTMLElement>} */
  const triggerRef = React.useRef();

  const preparedChildren = dropdown
    ? children
    : children.map((ch) => {
        if (ch?.type?.displayName === "Dropdown") {
          return React.cloneElement(ch, {
            ...ch.props,
            ref: finalRef,
            key: "dropdown",
          });
        }

        return ch;
      });

  const handleClick = React.useCallback(
    (e) => {
      if (!closeOnClickOutside) return;

      const target = e.target;
      const triggerClicked = cn("dropdown").elem("trigger").closest(target);
      const dropdownClicked = cn("dropdown").closest(target);

      if (!triggerClicked && !dropdownClicked) {
        finalRef.current?.close?.();
      }
    },
    [closeOnClickOutside, finalRef]
  );

  const handleToggle = React.useCallback(
    (e) => {
      if (!cn("dropdown").closest(e.target)) {
        finalRef?.current?.toggle();
      }
    },
    [finalRef]
  );

  React.useEffect(() => {
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [closeOnClickOutside, handleClick]);

  return (
    <DropdownContext.Provider value={{ triggerRef }}>
      {React.createElement(
        tagName ?? "div",
        {
          ...props,
          ref: triggerRef,
          className: cn("dropdown").elem("trigger").mix(props.className),
          onClickCapture: handleToggle,
        },
        ...preparedChildren
      )}
    </DropdownContext.Provider>
  );
};
