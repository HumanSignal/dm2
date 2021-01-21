import { Button, Modal, Space } from "antd";
import { inject, observer } from "mobx-react";
import React from "react";
import { BsTrash } from "react-icons/bs";

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

    return (
      <Space style={{ flexWrap: "wrap" }}>
        Selected: {selectedLength}
        <Space size="small" style={{ flexWrap: "wrap" }}>
          {/* <Button size={size} onClick={() => store.currentView.selectAll()}>
            {selected.all && !selected.isIndeterminate
              ? "Unselect all"
              : "Select all"}
          </Button>

          <Divider type="vertical" /> */}

          {actions.map((action) => {
            const isDeleteAction = action.id.includes("delete");
            return (
              <Button
                className="flex-button"
                danger={isDeleteAction}
                size={size}
                key={action.id}
                onClick={() => invokeAction(action)}
              >
                {isDeleteAction && (
                  <BsTrash style={{ fontSize: 14, marginRight: 5 }} />
                )}
                {action.title}
              </Button>
            );
          })}
        </Space>
      </Space>
    );
  })
);
