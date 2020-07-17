import React from "react";
import { observer } from "mobx-react";

import { Switch, Menu } from "antd";

const FieldsMenu = observer(({ item, store }) => {
  const menuItem = (f) => (
    <Menu.Item key={f.key}>
      {f.canToggle ? <Switch defaultChecked /> : null}
      {f.title}
    </Menu.Item>
  );

  return (
    <Menu size="small" onClick={() => {}}>
      <Menu.ItemGroup title="Tasks">
        {item.fieldsSource("tasks").map(menuItem)}
      </Menu.ItemGroup>
      <Menu.ItemGroup title="Annotations">
        {item.fieldsSource("annotations").map(menuItem)}
      </Menu.ItemGroup>
      <Menu.ItemGroup title="Input">
        {item.fieldsSource("inputs").map(menuItem)}
      </Menu.ItemGroup>

      <Menu.ItemGroup title="v2: Results">
        <Menu.Item key="5">class</Menu.Item>
      </Menu.ItemGroup>
    </Menu>
  );
});

export default FieldsMenu;
