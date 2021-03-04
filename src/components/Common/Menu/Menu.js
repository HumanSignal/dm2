import React from "react";
import { cn } from "../../../utils/bem";
import "./Menu.styl";
import { MenuContext } from "./MenuContext";
import { MenuItem } from "./MenuItem";

export const Menu = React.forwardRef(
  ({ children, className, style, size, selectedKeys }, ref) => {
    const rootClass = cn("menu").mod({ size }).mix(className);
    const selected = React.useMemo(() => {
      return new Set(selectedKeys ?? []);
    }, [selectedKeys]);

    return (
      <MenuContext.Provider value={{ selected }}>
        <ul ref={ref} className={rootClass} style={style}>
          {children}
        </ul>
      </MenuContext.Provider>
    );
  }
);

Menu.Item = MenuItem;
Menu.Spacer = () => <li className={cn("menu", { elem: "spacer" })}></li>;
Menu.Divider = () => <li className={cn("menu", { elem: "divider" })}></li>;
Menu.Builder = (url, menuItems) => {
  return (menuItems ?? []).map((item, index) => {
    if (item === "SPACER") return <Menu.Spacer key={index} />;
    if (item === "DIVIDER") return <Menu.Divider key={index} />;

    const [path, label] = item;
    const location = `${url}${path}`.replace(/([/]+)/g, "/");

    return (
      <Menu.Item key={index} to={location} exact>
        {label}
      </Menu.Item>
    );
  });
};

Menu.Group = ({ children, title, className, style }) => {
  const rootClass = cn("menu-group");
  return (
    <li className={rootClass.mix(className)} style={style}>
      <div className={rootClass.elem("title")}>{title}</div>
      <ul className={rootClass.elem("list")}>{children}</ul>
    </li>
  );
};
