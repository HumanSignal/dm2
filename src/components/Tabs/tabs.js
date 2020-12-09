import { Button, PageHeader, Tabs } from "antd";
import { inject, observer } from "mobx-react";
import React from "react";
import { RiCloseLine } from "react-icons/ri";
import { Filters } from "../Filters/Filters";
import { DataView } from "../Table/Table";
import { TabTitle } from "./tabs-pane";
import { TablePanel } from "./tabs-panel";
import { TabsStyles } from "./Tabs.styles";

const TabContent = observer(({ views, view, data, columns }) => {
  return (
    <DataView
      key={`data-${view.target}`}
      view={view}
      data={Array.from(data)}
      columns={columns}
      hiddenColumns={view.hiddenColumnsList}
    />
  );
});

const createTab = (views, data, columns) => (view) => {
  const title = <TabTitle item={view} data={data} />;

  return (
    <Tabs.TabPane key={view.key} closable={false} tab={title}>
      <TablePanel views={views} view={view} />
      <TabContent views={views} view={view} data={data} columns={columns} />
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

export const TabsWrapper = inject("store")(
  observer(({ store }) => {
    const views = store.viewsStore;
    const activeTab = store.viewsStore.selected;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const columns = React.useMemo(() => activeTab.fieldsAsColumns, [
      activeTab,
      activeTab.target,
    ]);

    return (
      <TabsStyles>
        <Tabs
          type="editable-card"
          activeKey={activeTab.key}
          onEdit={() => store.viewsStore.addView()}
          onChange={(key) => store.viewsStore.setSelected(key)}
        >
          {store.viewsStore.all.map(
            createTab(views, store.dataStore.list, columns)
          )}
        </Tabs>
        <FiltersSidebar views={views} />
      </TabsStyles>
    );
  })
);
