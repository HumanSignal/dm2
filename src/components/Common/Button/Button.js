import React from "react";
import { cn } from "../../../utils/bem";
import "./Button.styl";

export const Button = ({
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
}) => {
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

  return React.createElement(
    tagName,
    {
      className: rootClass.mod(mods).mix(className),
      type: type,
      ...rest,
    },
    <>
      {icon && <span className={rootClass.elem("icon")}>{icon}</span>}
      {children && <span className={rootClass.elem("body")}>{children}</span>}
      {extra !== undefined ? (
        <span className={rootClass.elem("extra")}>{extra}</span>
      ) : null}
    </>
  );
};

Button.Group = ({ className, children }) => {
  return (
    <div className={[cn("button-group"), className].join(" ")}>{children}</div>
  );
};
