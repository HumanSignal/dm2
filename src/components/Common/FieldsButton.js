import { CaretDownOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Checkbox, Dropdown, Menu } from "antd";
import { inject, observer } from "mobx-react";
import React from "react";
import styled from "styled-components";

const injector = inject(({ store }) => {
  return {
    columns: Array.from(store.currentView?.targetColumns ?? []),
  };
});

const MenuWrapper = styled.div`
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);

  .ant-menu-item {
    height: 32px;
    margin: 0;
    margin-bottom: 0 !important;
    padding: 5px 12px;
    line-height: 22px;
  }

  .ant-menu-item-group-title {
    padding: 5px 12px;
  }

  .ant-menu-item-group ul {
    margin: 0 8px;
  }
`;

const FieldsMenu = observer(({ columns }) => {
  const MenuItem = (col) => (
    <Menu.Item key={col.key}>
      <Checkbox
        size="small"
        checked={!col.hidden}
        onChange={col.toggleVisibility}
        style={{ width: "100%", height: "100%" }}
      >
        {col.title}
      </Checkbox>
    </Menu.Item>
  );

  return (
    <MenuWrapper>
      <Menu size="small" style={{ padding: "4px 0" }}>
        {columns.map((col) => {
          if (col.children) {
            return (
              <Menu.ItemGroup key={col.key} title={col.title}>
                {col.children.map(MenuItem)}
              </Menu.ItemGroup>
            );
          } else if (!col.parent) {
            return MenuItem(col);
          }

          return null;
        })}
      </Menu>
    </MenuWrapper>
  );
});

export const FieldsButton = injector(({ columns, size }) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <Dropdown
      trigger="click"
      overlay={<FieldsMenu columns={columns} />}
      visible={visible}
      onVisibleChange={setVisible}
    >
      <Button size={size}>
        <EyeOutlined /> Fields <CaretDownOutlined />
      </Button>
    </Dropdown>
  );
});
