import React from "react";
import ReactDOM from "react-dom";
import { cn } from "../../../utils/bem";
import { alignElements } from "../../../utils/dom";
import { aroundTransition } from "../../../utils/transition";
import "./Dropdown.styl";
import { DropdownContext } from "./DropdownContext";
import { DropdownTrigger } from "./DropdownTrigger";

export const Dropdown = React.forwardRef(
  (
    {
      animated = true,
      visible = false,
      transitionClass = null,
      visibleClass = null,
      ...props
    },
    ref
  ) => {
    const rootName = cn("dropdown");

    /**@type {import('react').RefObject<HTMLElement>} */
    const dropdown = React.useRef();
    const { triggerRef } = React.useContext(DropdownContext) ?? {};
    const isInline = triggerRef === undefined;

    const { children } = props;
    const [currentVisible, setVisible] = React.useState(visible);
    const [offset, setOffset] = React.useState({});
    const [visibility, setVisibility] = React.useState(
      visible ? "visible" : null
    );

    const calculatePosition = React.useCallback(() => {
      const dropdownEl = dropdown.current;
      const parent = triggerRef?.current ?? dropdownEl.parentNode;
      const { pos, left, top } = alignElements(
        parent,
        dropdownEl,
        "bottom-left"
      );

      console.log(pos, left, top);
      setOffset({ left, top });
    }, [triggerRef]);

    const performAnimation = React.useCallback(
      (visible = false) => {
        return new Promise((resolve) => {
          const menu = dropdown.current;

          if (props.animated !== false) {
            aroundTransition(menu, {
              transition: () => {
                setVisibility(visible ? "appear" : "disappear");
              },
              beforeTransition: () => {
                setVisibility(visible ? "before-appear" : "before-disappear");
              },
              afterTransition: () => {
                setVisibility(visible ? "visible" : null);
                resolve();
              },
            });
          } else {
            setVisibility(visible ? "visible" : null);
            resolve();
          }
        });
      },
      [props.animated]
    );

    const close = React.useCallback(async () => {
      if (currentVisible === false) return;

      props.onToggle?.(false);
      await performAnimation(false);
      setVisible(false);
    }, [currentVisible, performAnimation, props]);

    const open = React.useCallback(async () => {
      if (currentVisible === true) return;

      props.onToggle?.(true);
      await performAnimation(true);
      setVisible(true);
    }, [currentVisible, performAnimation, props]);

    const toggle = React.useCallback(async () => {
      const newState = !currentVisible;

      if (newState) {
        open();
      } else {
        close();
      }
    }, [close, currentVisible, open]);

    React.useEffect(() => {
      if (!ref) return;

      ref.current = {
        toggle,
        open,
        close,
      };
    }, [close, open, ref, toggle]);

    React.useEffect(() => {
      setVisible(visible);
    }, [visible]);

    React.useEffect(() => {
      if (!isInline && visibility === "before-appear") {
        calculatePosition();
      }
    }, [visibility, calculatePosition, isInline]);

    const content =
      children.props && children.props.type === "Menu"
        ? React.cloneElement(children, {
            ...children.props,
            className: rootName.elem("menu").mix(children.props.className),
          })
        : children;

    const visibilityClasses = React.useMemo(() => {
      switch (visibility) {
        case "before-appear":
          return "before-appear";
        case "appear":
          return "appear before-appear";
        case "before-disappear":
          return "before-disappear";
        case "disappear":
          return "disappear before-disappear";
        case "visible":
          return "visible";
        default:
          return visible ? "visible" : null;
      }
    }, [visibility, visible]);

    const result = (
      <div
        ref={dropdown}
        className={rootName.mix(props.className, visibilityClasses)}
        style={{ ...(props.style ?? {}), ...(offset ?? {}) }}
      >
        {content}
      </div>
    );

    return props.inline === true
      ? result
      : ReactDOM.createPortal(result, document.body);
  }
);

Dropdown.displayName = "Dropdown";

Dropdown.Trigger = DropdownTrigger;
