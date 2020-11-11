import { DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, Input } from "antd";
import { observer } from "mobx-react";
import React from "react";
import { TabsMenu } from "./tabs-menu";

export const TabTitle = observer(({ item }) => {
  const saveTabTitle = (ev) => {
    if (ev.type === "blur" || ev.key === "Enter") {
      item.setRenameMode(false);
    } else if (ev.key === "Escape") {
      item.setRenameMode(false);
      item.setTitle(item.oldTitle);
    }
  };
  return (
    <span>
      {item.renameMode ? (
        <Input
          size="small"
          autoFocus={true}
          style={{ width: 100 }}
          defaultValue={item.title}
          onKeyDown={saveTabTitle}
          onBlur={saveTabTitle}
          onChange={(ev) => item.setTitle(ev.target.value)}
        />
      ) : (
        item.title
      )}

      <Dropdown overlay={TabsMenu(item)} trigger={["click"]}>
        <Button type="link" size="small" onClick={(e) => e.preventDefault()}>
          <DownOutlined />
        </Button>
      </Dropdown>
    </span>
  );
});
