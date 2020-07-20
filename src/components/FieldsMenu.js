import React from "react";
import { observer } from "mobx-react";
import { Switch, Menu } from "antd";

import fields from "../data/fields";
import styles from "./Table.scss";

const FieldsMenu = observer(({ item, store }) => {
  const menuItem = (f) => (
    <Menu.Item key={f.source + f.field} onClick={f.toggle} className={"fields-menu-item"}>
      {fields(f.field).title}
      {f.canToggle ? <Switch checked={f.enabled} size="small" /> : null}
    </Menu.Item>
  );

  return (
    <Menu size="small" onClick={() => {}}>
      {item.target === 'tasks' && (<Menu.ItemGroup title="Tasks">
        {item.fieldsSource("tasks").map(menuItem)}
      </Menu.ItemGroup>)}
      {item.target === 'annotations' && (<Menu.ItemGroup title="Annotations">
        {item.fieldsSource("annotations").map(menuItem)}
      </Menu.ItemGroup>)}
      <Menu.ItemGroup title="Input">
        {item.fieldsSource("inputs").map(menuItem)}
      </Menu.ItemGroup>

      {/* <Menu.ItemGroup title="v2: Results"> */}
      {/*   <Menu.Item key="5">class</Menu.Item> */}
      {/* </Menu.ItemGroup> */}
    </Menu>
  );
});

export default FieldsMenu;
