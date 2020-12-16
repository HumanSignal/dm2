import { CaretDownOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Checkbox, Dropdown, Menu } from "antd";
import { inject } from "mobx-react";
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

const injector = inject(({ store }) => {
  return {
    columns: store.currentView?.targetColumns ?? [],
  };
});

export const FieldsButton = injector(({ columns, size }) => {
  const [isVisible, setVisible] = React.useState(false);
  const menu = columns.map((col) => {
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
  });

  return (
    <Dropdown
      visible={isVisible}
      overlay={() => <Menu size="small">{menu}</Menu>}
      onVisibleChange={(visible) => setVisible(visible)}
      trigger="click"
    >
      <Button size={size}>
        <EyeOutlined /> Fields <CaretDownOutlined />
      </Button>
    </Dropdown>
  );
});
