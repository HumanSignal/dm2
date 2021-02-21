import { Button, PageHeader, Space } from "antd";
import { inject } from "mobx-react";
import React from "react";
import { FaPlus } from "react-icons/fa";
import { RiCloseLine } from "react-icons/ri";
import { Spinner } from "../Common/Spinner";
import { Tabs } from "../Common/Tabs/Tabs";
import { Filters } from "../Filters/Filters";
import { DataView } from "../Table/Table";
import { TablePanel } from "./tabs-panel";
import { TabTitle } from "./tabs-title";
import { TabsStyles, TabsWrapper } from "./Tabs.styles";

const injector = inject(({ store }) => {
  const { sidebarEnabled, sidebarVisible } = store.viewsStore ?? {};
  return {
    shrinkWidth: sidebarEnabled && sidebarVisible,
  };
});

const sidebarInjector = inject(({ store }) => {
  const viewsStore = store.viewsStore;
  return {
    viewsStore,
    sidebarEnabled: viewsStore?.sidebarEnabled,
    sidebarVisible: viewsStore?.sidebarVisible,
  };
});

const summaryInjector = inject(({ store }) => {
  const { project, taskStore } = store;

  return {
    totalTasks: project?.task_count ?? 0,
    totalFoundTasks: taskStore?.total ?? 0,
    totalCompletions: taskStore?.totalCompletions ?? 0,
    totalPredictions: taskStore?.totalPredictions ?? 0,
    cloudSync: project.target_syncing ?? project.source_syncing ?? false,
  };
});

const switchInjector = inject(({ store }) => {
  return {
    views: store.viewsStore,
    tabs: Array.from(store.viewsStore?.all ?? []),
    selectedKey: store.viewsStore?.selected?.key,
  };
});

const FiltersSidebar = sidebarInjector(
  ({ viewsStore, sidebarEnabled, sidebarVisible }) => {
    return sidebarEnabled && sidebarVisible ? (
      <div className="sidebar">
        <PageHeader
          title="Filters"
          extra={
            <Button
              key="close-filters"
              type="link"
              onClick={() => viewsStore.collapseFilters()}
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
        <Filters sidebar={true} />
      </div>
    ) : null;
  }
);

const ProjectSummary = summaryInjector((props) => {
  return (
    <Space size="small" style={{ paddingRight: "1em" }}>
      {props.cloudSync && (
        <Space style={{ fontSize: 12, fontWeight: 400, opacity: 0.8 }}>
          Storage sync
          <Spinner size="small" />
        </Space>
      )}
      <span style={{ display: "flex", alignItems: "center", fontSize: 12 }}>
        <Space size="large">
          <span>
            Tasks: {props.totalFoundTasks} / {props.totalTasks}
          </span>
          <span>Completions: {props.totalCompletions}</span>
          <span>Predictions: {props.totalPredictions}</span>
        </Space>
      </span>
    </Space>
  );
});

const TabsSwitch = switchInjector(({ views, tabs, selectedKey }) => {
  return (
    <Tabs
      type="editable-card"
      activeTab={selectedKey}
      onEdit={() => views.addView()}
      onChange={(key) => views.setSelected(key)}
      tabBarExtraContent={<ProjectSummary />}
      addIcon={<FaPlus color="#595959" />}
    >
      {tabs.map((tab) => (
        <TabTitle
          key={tab.key}
          tab={tab.key}
          item={tab}
          active={tab.key === selectedKey}
        />
      ))}
    </Tabs>
  );
});

export const DMTabs = injector(({ shrinkWidth }) => {
  return (
    <TabsStyles>
      <TabsWrapper className="tabs-wrapper" shrinkWidth={shrinkWidth}>
        <TabsSwitch />
        <TablePanel />
        <DataView />
      </TabsWrapper>
      <FiltersSidebar />
    </TabsStyles>
  );
});
