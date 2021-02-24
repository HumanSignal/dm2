import React from "react";
import ReactDOM from "react-dom";
import { cn } from "../../../utils/bem";
import { alignElements } from "../../../utils/dom";
import { aroundTransition } from "../../../utils/transition";
import "./Tooltip.styl";

export const Tooltip = React.forwardRef(
  ({ title, children, defaultVisible, style }, ref) => {
    if (!children || Array.isArray(children)) {
      throw new Error("Tooltip does accept a single child only");
    }

    const rootClass = cn("tooltip");
    const triggerElement = ref ?? React.useRef();
    const tooltipElement = React.useRef();
    const [offset, setOffset] = React.useState({});
    const [visibility, setVisibility] = React.useState(
      defaultVisible ? "visible" : null
    );
    const [injected, setInjected] = React.useState(false);

    const calculatePosition = React.useCallback(() => {
      const { left, top } = alignElements(
        triggerElement.current,
        tooltipElement.current,
        "top-center"
      );

      setOffset({ left, top });
    }, [triggerElement.current, tooltipElement.current]);

    const performAnimation = React.useCallback(
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
          return visibility ? "visible" : null;
      }
    }, [visibility]);

    const tooltipClass = React.useMemo(() => rootClass.mix(visibilityClasses), [
      rootClass,
      visibilityClasses,
    ]);

    const tooltip = React.useMemo(
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

    const child = React.Children.only(children);
    const clone = React.cloneElement(child, {
      ...children.props,
      ref: triggerElement,
      onMouseEnter(e) {
        setInjected(true);
        children.props.onMouseEnter?.(e);
      },
      onMouseLeave(e) {
        performAnimation(false);
        children.props.onMouseLeave?.(e);
      },
    });

    React.useEffect(() => {
      if (injected) performAnimation(true);
    }, [injected]);

    return (
      <>
        {clone}
        {ReactDOM.createPortal(tooltip, document.body)}
      </>
    );
  }
);
Tooltip.displayName = "Tooltip";
