import { BsTrash } from "react-icons/bs";
import { Button, Divider, Modal, Space } from "antd";
import { inject, observer } from "mobx-react";
import React from "react";

export const TabsActions = inject("store")(
  observer(({ store, size }) => {
    const { selected } = store.currentView;
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
      <Space>
        Selected: {selectedLength}
        <Space size="small">
          <Button size={size} onClick={() => store.currentView.selectAll()}>
            {selected.all && !selected.isIndeterminate
              ? "Unselect all"
              : "Select all"}
          </Button>

          <Divider type="vertical" />

          {actions.map((action) => {
            return (
              <Button
                danger={action.id.includes("delete")}
                size={size}
                key={action.id}
                icon={
                  <BsTrash
                    style={{
                      "font-size": "14px",
                      "margin-right": "5px",
                      "padding-top": "3px",
                    }}
                  />
                }
                onClick={() => invokeAction(action)}
              >
                {action.title}
              </Button>
            );
          })}
        </Space>
      </Space>
    );
  })
);
