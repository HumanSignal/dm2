import color from "chroma-js";
import React from "react";
import { cn } from "../../../utils/bem";
import { colors } from "../../../utils/colors";
import "./Tag.styl";

const prepareColor = (colorString) => {
  const baseColor = color(colorString);
  return {
    color: baseColor,
    background: baseColor.desaturate(2).brighten(2.2),
    "shadow-color": baseColor.desaturate(1).brighten(1.22),
  };
};

const getColor = (colorString) => {
  if (colorString) {
    return colors[colorString] ?? colorString;
  } else {
    return colors.blue;
  }
};

export const Tag = ({ className, style, size, color, children }) => {
  const finalColor = Object.entries(prepareColor(getColor(color))).reduce(
    (res, [key, color]) => ({ ...res, [`--${key}`]: color }),
    {}
  );

  return (
    <span
      className={cn("tag").mod({ size }).mix(className)}
      style={{ ...(style ?? {}), ...finalColor }}
    >
      {children}
    </span>
  );
};
