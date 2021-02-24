import React from "react";
import { Block } from "../../../utils/bem";
import "./Icon.styl";

const importedIcons = new Map();

export const Icon = React.forwardRef(({ name, ...props }, ref) => {
  const [icon, setIcon] = React.useState();

  const updateIcon = (SVGIcon) => {
    setIcon(<SVGIcon {...props} />);
  };

  React.useEffect(() => {
    console.log("updated");
    if (importedIcons.has(name)) {
      console.log("icon restored");
      updateIcon(importedIcons.get(name));
    } else {
      import(`react-icons/fa`).then(({ [name]: SVGIcon }) => {
        importedIcons.set(name, SVGIcon);
        updateIcon(SVGIcon);
      });
    }
  }, [name]);

  return (
    <Block tag="span" name="icon" ref={ref}>
      {icon}
    </Block>
  );
});
