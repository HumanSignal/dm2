import { Checkbox, Menu } from "antd";
import React from "react";

const menuItem = (col) => (
  <Menu.Item key={col.key}>
    <Checkbox
      size="small"
      checked={!col.hidden}
      onChange={col.toggleVisibility}
      style={{ width: "100%" }}
    >
      {col.title}
    </Checkbox>
  </Menu.Item>
);

const TabFieldsMenu = (view) => {
  return (
    <Menu size="small">
      {view.targetColumns.map((col) => {
        if (col.children) {
          return (
            <Menu.ItemGroup key={col.key} title={col.title}>
              {col.children.map(menuItem)}
            </Menu.ItemGroup>
          );
        } else if (!col.parent) {
          return menuItem(col);
        }

        return null;
      })}
    </Menu>
  );
};

export default TabFieldsMenu;
