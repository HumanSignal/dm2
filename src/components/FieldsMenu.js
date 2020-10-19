import { Checkbox, Menu } from "antd";
import { observer } from "mobx-react";
import React from "react";
import fields from "../data/fields";

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
      <Menu.Item
        key={f.source + f.field}
        icon={<CheckboxItem enabled={f.enabled} canToggle={f.canToggle} />}
        onClick={f.toggle}
        className={"fields-menu-item"}
      >
        {fields(f.field).title}
      </Menu.Item>
    );
  };

  return <Menu.ItemGroup title={title}>{group.map(menuItem)}</Menu.ItemGroup>;
};

const FieldsMenu = observer(({ item, store }) => {
  return (
    <Menu size="small" onClick={() => {}}>
      {item.target === "tasks" &&
        menuItems({ title: "Tasks", group: item.fieldsSource("tasks") })}
      {item.target === "annotations" &&
        menuItems({
          title: "Annotations",
          group: item.fieldsSource("annotations"),
        })}
      {menuItems({ title: "Input", group: item.fieldsSource("inputs") })}
    </Menu>
  );
});

export default FieldsMenu;
