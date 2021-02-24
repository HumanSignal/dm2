import React from "react";
import { cn } from "../../../utils/bem";
import "./Button.styl";

export const Button = React.forwardRef(
  (
    {
      children,
      type,
      extra,
      className,
      href,
      primary,
      size,
      compact,
      waiting,
      danger,
      icon,
      ...rest
    },
    ref
  ) => {
    const rootClass = cn("button");
    const tagName = href ? "a" : "button";

    const mods = {};
    const classList = [rootClass, rootClass.mod({ type })];

    if (primary) mods.primary = primary;
    if (compact) mods.compact = compact;
    if (size) mods.size = size;
    if (danger) mods.danger = danger;
    if (icon) mods.withIcon = true;
    if (extra) mods.withExtra = true;
    if (waiting) mods.waiting = true;
    if (type) mods.type = type;

    classList.push(rootClass.mod(mods));
    classList.push(className);

    const iconElem = React.useMemo(() => {
      if (!icon) return null;

      switch (size) {
        case "small":
          return React.cloneElement(icon, { ...icon.props, size: 12 });
        case "compact":
          return React.cloneElement(icon, { ...icon.props, size: 14 });
        default:
          return icon;
      }
    }, [icon, size]);

    const onClick = rest.onClick || null;

    return React.createElement(
      tagName,
      {
        ref,
        className: rootClass.mod(mods).mix(className),
        type: type,
        ...rest,
        onClick,
      },
      <>
        {iconElem && <span className={rootClass.elem("icon")}>{iconElem}</span>}
        {iconElem && children ? <span>{children}</span> : children}
        {extra !== undefined ? (
          <span className={rootClass.elem("extra")}>{extra}</span>
        ) : null}
      </>
    );
  }
);

Button.Group = ({ className, children, collapsed }) => {
  return (
    <div
      className={[cn("button-group").mod({ collapsed }), className].join(" ")}
    >
      {children}
    </div>
  );
};
