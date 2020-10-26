import { DownOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";
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
            console.log(ev.key);
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
      <Dropdown overlay={<TabsMenu item={item} />} trigger={["click"]}>
        <a
          href="#down"
          className="ant-dropdown-link"
          onClick={(e) => e.preventDefault()}
        >
          <DownOutlined />
        </a>
      </Dropdown>
    </span>
  );
});
