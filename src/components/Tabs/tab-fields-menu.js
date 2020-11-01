import { Checkbox, Menu, Switch } from "antd";
import { observer } from "mobx-react";
import React from "react";
import fields from "../../data/fields";

const CheckboxItem = ({ canToggle, enabled }) => {
  return (
    <span
      style={{
        display: "inline-block",
        width: 20,
        height: 20,
        marginRight: 10,
      }}
    >
      {canToggle ? <Checkbox checked={enabled} /> : null}
    </span>
  );
};

const menuItems = ({ title, group }) => {
  const menuItem = (f) => {
    return (
      f.canToggle && (
        <Menu.Item
          key={f.source + f.field}
          icon={<CheckboxItem enabled={f.enabled} canToggle={f.canToggle} />}
          onClick={f.toggle}
          className={"fields-menu-item"}
        >
          {fields(f.field).title}
        </Menu.Item>
      )
    );
  };

  return <Menu.ItemGroup title={title}>{group.map(menuItem)}</Menu.ItemGroup>;
};

const TabFieldsMenu = observer(({ view }) => {
  const menuItem = (col) => (
    <Menu.Item
      key={col.key}
      icon={<Switch checked={!col.hidden} size="small" />}
      onClick={col.toggleVisibility}
    >
      {col.title}
    </Menu.Item>
  );

  return (
    <Menu size="small" onClick={() => {}}>
      {view.columns.map((col) => {
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
});

export default TabFieldsMenu;
