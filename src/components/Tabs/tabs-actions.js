import { Button, Divider, Space } from "antd";
import { inject, observer } from "mobx-react";
import React from "react";

export const TabsActions = inject("store")(
  observer(({ store, size }) => {
    const { selected } = store.currentView;
    const selectedLength = store.currentView.selectedLength;
    const actions = store.availableActions
      .filter((a) => !a.hidden)
      .sort((a, b) => a.order - b.order);

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
                size={size}
                key={action.id}
                onClick={() => store.invokeAction(action.id)}
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
