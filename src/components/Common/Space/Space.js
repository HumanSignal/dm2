import React from "react";
import { cn } from "../../../utils/bem";
import "./Space.styl";

export const Space = ({
  direction = "horizontal",
  size,
  className,
  style,
  children,
}) => {
  return (
    <div
      className={cn("space").mod({ direction, size }).mix(className)}
      style={style}
    >
      {children}
    </div>
  );
};
