import { Children, cloneElement, forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../../utils/bem";
import { alignElements } from "../../../utils/dom";
import { aroundTransition } from "../../../utils/transition";
import "./Tooltip.styl";

export const Tooltip = forwardRef(
  ({ title, children, defaultVisible, style }, ref) => {
    if (!children || Array.isArray(children)) {
      throw new Error("Tooltip does accept a single child only");
    }

    const rootClass = cn("tooltip");
    const triggerElement = ref ?? useRef();
    const tooltipElement = useRef();
    const [offset, setOffset] = useState({});
    const [visibility, setVisibility] = useState(
      defaultVisible ? "visible" : null
    );
    const [injected, setInjected] = useState(false);

    const calculatePosition = useCallback(() => {
      const { left, top } = alignElements(
        triggerElement.current,
        tooltipElement.current,
        "top-center",
        10
      );

      setOffset({ left, top });
    }, [triggerElement.current, tooltipElement.current]);

    const performAnimation = useCallback(
      (visible) => {
        if (tooltipElement.current) {
          aroundTransition(tooltipElement.current, {
            beforeTransition() {
              setVisibility(visible ? "before-appear" : "before-disappear");
            },
            transition() {
              if (visible) calculatePosition();
              setVisibility(visible ? "appear" : "disappear");
            },
            afterTransition() {
              setVisibility(visible ? "visible" : null);
              if (visible === false) setInjected(false);
            },
          });
        }
      },
      [injected, calculatePosition, tooltipElement]
    );

    const visibilityClasses = useMemo(() => {
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
          return visibility ? "visible" : null;
      }
    }, [visibility]);

    const tooltipClass = useMemo(() => rootClass.mix(visibilityClasses), [
      rootClass,
      visibilityClasses,
    ]);

    const tooltip = useMemo(
      () =>
        injected ? (
          <div
            className={tooltipClass}
            ref={tooltipElement}
            style={{ ...offset, ...(style ?? {}) }}
          >
            <div className={rootClass.elem("body")}>{title}</div>
          </div>
        ) : null,
      [injected, offset, rootClass, title, tooltipClass, tooltipElement]
    );

    const child = Children.only(children);
    const clone = cloneElement(child, {
      ...child.props,
      ref: triggerElement,
      onMouseEnter(e) {
        setInjected(true);
        child.props.onMouseEnter?.(e);
      },
      onMouseLeave(e) {
        performAnimation(false);
        child.props.onMouseLeave?.(e);
      },
    });

    useEffect(() => {
      if (injected) performAnimation(true);
    }, [injected]);

    return (
      <>
        {clone}
        {createPortal(tooltip, document.body)}
      </>
    );
  }
);
Tooltip.displayName = "Tooltip";
