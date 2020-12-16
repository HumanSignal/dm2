import { Button, Divider, PageHeader, Space, Tabs, Tag } from "antd";
import { inject, observer } from "mobx-react";
import React from "react";
import { RiCloseLine } from "react-icons/ri";
import { Spinner } from "../Common/Spinner";
import { Filters } from "../Filters/Filters";
import { DataView } from "../Table/Table";
import { TabTitle } from "./tabs-pane";
import { TablePanel } from "./tabs-panel";
import { TabsStyles } from "./Tabs.styles";

const createTab = (data) => (view) => {
  const title = <TabTitle item={view} data={data} />;

  return (
    <Tabs.TabPane key={view.key} closable={false} tab={title}>
      <TablePanel />
      <DataView />
    </Tabs.TabPane>
  );
};

const FiltersSidebar = observer(({ views }) => {
  return views.sidebarEnabled && views.sidebarVisible ? (
    <div className="sidebar">
      <PageHeader
        title="Filters"
        extra={
          <Button
            key="close-filters"
            type="link"
            onClick={() => views.collapseFilters()}
            style={{ display: "inline-flex", alignItems: "center" }}
          >
            <RiCloseLine size={24} />
          </Button>
        }
        style={{
          margin: "0 0 10px",
          padding: "0 10px",
          height: 24,
        }}
      />
      <Filters sidebar={true} filters={Array.from(views.selected.filters)} />
    </div>
  ) : null;
});

const ProjectSummary = observer(({ store, project }) => {
  const cloudSync = project.target_syncing || project.source_syncing;
  return (
    <Space size="small" style={{ paddingRight: "1em" }}>
      {cloudSync && (
        <Space style={{ fontSize: 12, fontWeight: 400, opacity: 0.8 }}>
          Storage sync
          <Spinner size="small" />
        </Space>
      )}
      <Tag style={{ marginRight: 0 }}>
        Tasks: {store.total}
        <Divider type="vertical" />
        Completions: {store.totalCompletions}
        <Divider type="vertical" />
        Predictions: {store.totalPredictions}
      </Tag>
    </Space>
  );
});

const injector = inject(({ store }) => {
  return {
    store,
    tabs: Array.from(store.viewsStore?.all ?? []),
    selectedKey: store.viewsStore?.selected?.key,
  };
});

export const TabsWrapper = injector(({ store, tabs, selectedKey }) => {
  const views = store.viewsStore;

  return (
    <TabsStyles>
      <Tabs
        type="editable-card"
        activeKey={selectedKey}
        onEdit={() => store.viewsStore.addView()}
        onChange={(key) => store.viewsStore.setSelected(key)}
        tabBarExtraContent={
          <ProjectSummary store={store.taskStore} project={store.project} />
        }
        tabBarStyle={{ paddingLeft: "1em" }}
      >
        {tabs.map(createTab(store.dataStore.list))}
      </Tabs>
      <FiltersSidebar views={views} />
    </TabsStyles>
  );
});
