import { DownOutlined } from "@ant-design/icons";
import { Button, Dropdown } from "antd";
import { observer } from "mobx-react";
import React from "react";
import { TabsMenu } from "./tabs-menu";

export const TabTitle = observer(({ item }) => {
  return (
    <span>
      {item.renameMode ? (
        <input
          type="text"
          value={item.title}
          onKeyPress={(ev) => {
            if (ev.key === "Enter") {
              item.setRenameMode(false);
              return;
            }
          }}
          onChange={(ev) => item.setTitle(ev.target.value)}
        />
      ) : (
        item.title
      )}
      &nbsp;&nbsp;&nbsp;&nbsp;
      <Dropdown overlay={TabsMenu(item)} trigger={["click"]}>
        <Button type="link" size="small" onClick={(e) => e.preventDefault()}>
          <DownOutlined />
        </Button>
      </Dropdown>
    </span>
  );
});
