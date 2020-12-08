import { Button, Space } from "antd";
import { inject, observer } from "mobx-react";
import React from "react";

export const TabsActions = inject("store")(
  observer(({ store }) => {
    const selected = store.currentView.selectedLength;
    const actions = store.availableActions
      .filter((a) => !a.hidden)
      .sort((a, b) => a.order - b.order);

    return !!selected && !!actions.length ? (
      <Space>
        Selected: {selected}
        <Space>
          {actions.map((action) => {
            return (
              <Button
                key={action.id}
                onClick={() => store.invokeAction(action.id)}
              >
                {action.title}
              </Button>
            );
          })}
        </Space>
      </Space>
    ) : null;
  })
);
