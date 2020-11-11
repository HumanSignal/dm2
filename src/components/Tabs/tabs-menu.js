import { Menu } from "antd";
import React from "react";

export const TabsMenu = (item) => {
  return (
    <Menu onClick={(e) => e.domEvent.stopPropagation()}>
      <Menu.Item key="0">
        <a
          href="#rename"
          onClick={(ev) => {
            ev.preventDefault();
            item.setRenameMode(true);
            return false;
          }}
        >
          Rename
        </a>
      </Menu.Item>
      <Menu.Item key="1">
        <a
          href="#duplicate"
          onClick={(ev) => {
            ev.preventDefault();
            item.parent.duplicateView(item);
            return false;
          }}
        >
          Duplicate
        </a>
      </Menu.Item>
      {item.parent.canClose ? (
        <>
          <Menu.Divider />
          <Menu.Item
            key="2"
            onClick={() => {
              item.parent.deleteView(item);
            }}
          >
            Close
          </Menu.Item>
        </>
      ) : null}
    </Menu>
  );
};
