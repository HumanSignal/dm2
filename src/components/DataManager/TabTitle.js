import { observer } from "mobx-react";
import React from "react";
import { FaEllipsisV } from "react-icons/fa";
import { Button } from "../Common/Button/Button";
import { Dropdown } from "../Common/Dropdown/Dropdown";
import { Icon } from "../Common/Icon/Icon";
import Input from "../Common/Input/Input";
import { TabsMenu } from "./TabsMenu";

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
    <>
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
        <Dropdown.Trigger content={TabsMenu(item)}>
          <Button
            type="link"
            size="small"
            style={{ padding: 5, marginLeft: 10 }}
            icon={<Icon icon={FaEllipsisV} />}
          />
        </Dropdown.Trigger>
      )}
    </>
  );
});
