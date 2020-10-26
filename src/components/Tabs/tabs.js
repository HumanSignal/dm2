import { Tabs } from "antd";
import { inject, observer } from "mobx-react";
import React from "react";
import { TabContent } from "./tabs-content";
import { TabTitle } from "./tabs-pane";
import "./tabs.scss";

export const TabsWrapper = inject("store")(
  observer(({ store }) => {
    const tasks = store.tasksStore;
    const activeTab = store.viewsStore.selected;
    const data =
      activeTab.target === "annotations" ? tasks.annotationsData : tasks.data;

    return (
      <Tabs
        onChange={(key) => {
          store.viewsStore.setSelected(key);
        }}
        activeKey={activeTab.key}
        onEdit={store.viewsStore.addView}
        type="editable-card"
        style={{ height: "100%" }}
      >
        {store.viewsStore.all.map((view) => (
          <Tabs.TabPane
            key={view.key}
            closable={false}
            tab={<TabTitle item={view} data={data} />}
            style={{ height: "100%" }}
          >
            <TabContent item={view} data={data} />
          </Tabs.TabPane>
        ))}
      </Tabs>
    );
  })
);
