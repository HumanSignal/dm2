import { Button, Dropdown, Input } from "antd";
import { observer } from "mobx-react";
import React from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { TabsMenu } from "./tabs-menu";

export const TabTitle = observer(({ item, active }) => {
  const saveTabTitle = (ev) => {
    const { type, key } = ev;

    if (type === "blur" || ["Enter", "Escape"].includes(key)) {
      ev.preventDefault();
      item.setRenameMode(false);
      if (key === "Escape") {
        item.setTitle(item.oldTitle);
      }

      item.save();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {item.renameMode ? (
        <Input
          size="small"
          autoFocus={true}
          style={{ width: 100 }}
          value={item.title}
          onKeyDownCapture={saveTabTitle}
          onBlur={saveTabTitle}
          onChangeCapture={(ev) => {
            item.setTitle(ev.target.value);
          }}
        />
      ) : (
        item.title
      )}

      {active && (
        <Dropdown overlay={TabsMenu(item)} trigger={["click"]}>
          <Button
            type="link"
            size="small"
            className="flex-button"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: 5, marginLeft: 10 }}
          >
            <BsThreeDotsVertical />
          </Button>
        </Dropdown>
      )}
    </div>
  );
});
