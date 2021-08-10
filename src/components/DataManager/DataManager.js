import { inject } from "mobx-react";
import React from "react";
import { FaPlus } from "react-icons/fa";
import { Block, Elem } from "../../utils/bem";
import { Interface } from "../Common/Interface";
import { Space } from "../Common/Space/Space";
import { Spinner } from "../Common/Spinner";
import { Tabs, TabsItem } from "../Common/Tabs/Tabs";
import { FiltersSidebar } from "../Filters/FiltersSidebar/FilterSidebar";
import { DataView } from "../Table/Table";
import "./DataManager.styl";
import { Toolbar } from "./Toolbar/Toolbar";

const injector = inject(({ store }) => {
  const { sidebarEnabled, sidebarVisible } = store.viewsStore ?? {};

  return {
    shrinkWidth: sidebarEnabled && sidebarVisible,
  };
});

const summaryInjector = inject(({ store }) => {
  const { project, taskStore } = store;

  return {
    totalTasks: project?.task_count ?? 0,
    totalFoundTasks: taskStore?.total ?? 0,
    totalAnnotations: taskStore?.totalAnnotations ?? 0,
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

const ProjectSummary = summaryInjector((props) => {
  return (
    <Space size="large" style={{ paddingRight: "1em" }}>
      {props.cloudSync && (
        <Space
          size="small"
          style={{ fontSize: 12, fontWeight: 400, opacity: 0.8 }}
        >
          Storage sync
          <Spinner size="small" />
        </Space>
      )}
      <span style={{ display: "flex", alignItems: "center", fontSize: 12 }}>
        <Space size="compact">
          <span>
            Tasks: {props.totalFoundTasks} / {props.totalTasks}
          </span>
          <span>Annotations: {props.totalAnnotations}</span>
          <span>Predictions: {props.totalPredictions}</span>
        </Space>
      </span>
    </Space>
  );
});

const TabsSwitch = switchInjector(({ views, tabs, selectedKey }) => {
  return (
    <Tabs
      activeTab={selectedKey}
      onAdd={() => views.addView({ reload: false })}
      onChange={(key) => views.setSelected(key)}
      tabBarExtraContent={<ProjectSummary />}
      addIcon={<FaPlus color="#595959" />}
    >
      {tabs.map((tab) => (
        <TabsItem
          key={tab.key}
          tab={tab.key}
          title={tab.title}
          onFinishEditing={(title) => {
            tab.setTitle(title);
            tab.save();
          }}
          onDuplicate={() => tab.parent.duplicateView(tab)}
          onClose={() => tab.parent.deleteView(tab)}
          active={tab.key === selectedKey}
          editable={tab.editable}
          deletable={tab.deletable}
        />
      ))}
    </Tabs>
  );
});

export const DataManager = injector(({ shrinkWidth }) => {
  return (
    <Block name="tabs-content">
      <Elem name="tab" mod={{ shrink: shrinkWidth }}>
        <Interface name="tabs">
          <TabsSwitch />
        </Interface>

        <Interface name="toolbar">
          <Toolbar />
        </Interface>

        <DataView />
      </Elem>
      <FiltersSidebar />
    </Block>
  );
});
