import { Tabs } from "antd";
import { inject, observer } from "mobx-react";
import React from "react";
import { Table } from "../Table/Table";
import { TabTitle } from "./tabs-pane";
import { TablePanel } from "./tabs-panel";
import "./tabs.scss";
import { TabsStyles } from "./Tabs.styles";

const getTabPaneProps = (view, data) => ({
  key: view.key,
  closable: false,
  tab: <TabTitle item={view} data={data} />,
});

const createTab = (data) => (view) => (
  <Tabs.TabPane {...getTabPaneProps(view, data)}>
    <TablePanel view={view} />
    <Table view={view} columns={view.fieldsAsColumns} data={Array.from(data)} />
  </Tabs.TabPane>
);

export const TabsWrapper = inject("store")(
  observer(({ store }) => {
    const tasks = store.tasksStore;
    const activeTab = store.viewsStore.selected;
    const data =
      activeTab.target === "annotations" ? tasks.annotationsData : tasks.data;

    return (
      <TabsStyles>
        <Tabs
          type="editable-card"
          activeKey={activeTab.key}
          onEdit={store.viewsStore.addView}
          onChange={(key) => store.viewsStore.setSelected(key)}
        >
          {store.viewsStore.all.map(createTab(data))}
        </Tabs>
      </TabsStyles>
    );
  })
);
