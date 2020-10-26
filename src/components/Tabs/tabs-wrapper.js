import { Tabs } from "antd";
import { observer } from "mobx-react";
import React from "react";
import { TabContent } from "./tabs-content";
import { TabTitle } from "./tabs-pane";

export const TabsWrapper = observer(({ store }) => {
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
    >
      {store.viewsStore.all.map((view) => (
        <Tabs.TabPane
          key={view.key}
          closable={false}
          tab={<TabTitle item={view} data={data} />}
        >
          <TabContent item={view} data={data} />
        </Tabs.TabPane>
      ))}
    </Tabs>
  );
});
