import { Button, Dropdown, Menu, Modal, Space } from "antd";
import { inject, observer } from "mobx-react";
import React from "react";
import { BsTrash } from "react-icons/bs";
import { FaAngleDown } from "react-icons/fa";

export const TabsActions = inject("store")(
  observer(({ store, size }) => {
    // const { selected } = store.currentView;
    const selectedLength = store.currentView.selectedLength;
    const actions = store.availableActions
      .filter((a) => !a.hidden)
      .sort((a, b) => a.order - b.order);

    const invokeAction = (action) => {
      if (action.dialog) {
        const { type: dialogType, text } = action.dialog;
        const dialog = Modal[dialogType] ?? Modal.confirm;

        dialog({
          title: "Destructive action.",
          content: text,
          onOk() {
            store.invokeAction(action.id);
          },
        });
      }
    };

    const actionButtons = actions.map((action) => {
      const isDeleteAction = action.id.includes("delete");
      return (
        <Menu.Item
          size={size}
          key={action.id}
          className="flex-button"
          danger={isDeleteAction}
          onClick={() => invokeAction(action)}
          icon={
            isDeleteAction && (
              <BsTrash style={{ fontSize: 14, marginRight: 5 }} />
            )
          }
        >
          {action.title}
        </Menu.Item>
      );
    });

    return (
      <Space style={{ flexWrap: "wrap" }}>
        Selected
        <Dropdown trigger="click" overlay={<Menu>{actionButtons}</Menu>}>
          <Button className="flex-button" size={size}>
            {selectedLength} tasks
            <FaAngleDown size="16" style={{ marginLeft: 4 }} color="#0077FF" />
          </Button>
        </Dropdown>
      </Space>
    );
  })
);
