import {
  AppstoreOutlined,
  BarsOutlined,
  CaretDownOutlined,
  DownOutlined,
  EyeOutlined,
  FilterOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, Menu, Radio, Space, Tabs } from "antd";
import { inject, observer } from "mobx-react";
import React from "react";
import FieldsMenu from "./FieldsMenu";
import Table from "./Table/Table";

const { TabPane } = Tabs;

const actionsMenu = (
  <Menu onClick={() => {}}>
    <Menu.Item key="1">Delete</Menu.Item>
  </Menu>
);

const DmPanel = observer(({ item }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: "1em",
        marginBottom: "1em",
      }}
    >
      <Space size="middle">
        <Radio.Group
          value={item.type}
          onChange={(e) => item.setType(e.target.value)}
        >
          <Radio.Button value="list">
            <BarsOutlined /> List
          </Radio.Button>
          <Radio.Button value="grid">
            <AppstoreOutlined /> Grid
          </Radio.Button>
        </Radio.Group>

        <Radio.Group
          value={item.target}
          onChange={(e) => item.setTarget(e.target.value)}
        >
          <Radio.Button value="tasks">Tasks</Radio.Button>
          <Radio.Button value="annotations">Annotations</Radio.Button>
        </Radio.Group>

        <Dropdown overlay={<FieldsMenu item={item} />}>
          <Button>
            <EyeOutlined /> Fields <CaretDownOutlined />
          </Button>
        </Dropdown>

        <Button
          type={item.enableFilters ? "primary" : ""}
          onClick={() => item.toggleFilters()}
        >
          <FilterOutlined /> Filters{" "}
        </Button>
      </Space>

      <Space size="middle">
        <Button
          disabled={item.target === "annotations"}
          onClick={() => item.root.setMode("label")}
        >
          <PlayCircleOutlined />
          Label All
        </Button>
        <Dropdown overlay={actionsMenu}>
          <Button>
            Actions <CaretDownOutlined />
          </Button>
        </Dropdown>
      </Space>
    </div>
  );
});

const DmPaneMenu = observer(({ item }) => {
  return (
    <Menu>
      <Menu.Item key="0">
        <a
          href="#rename"
          onClick={(ev) => {
            ev.preventDefault();
            item.setRenameMode(true);
            return false;
          }}
        >
          Rename
        </a>
      </Menu.Item>
      <Menu.Item key="1">
        <a
          href="#duplicate"
          onClick={(ev) => {
            ev.preventDefault();
            item.parent.duplicateView(item);
            return false;
          }}
        >
          Duplicate
        </a>
      </Menu.Item>
      <Menu.Divider />
      {item.parent.canClose ? (
        <Menu.Item
          key="2"
          onClick={() => {
            item.parent.deleteView(item);
          }}
        >
          Close
        </Menu.Item>
      ) : null}
    </Menu>
  );
});

const DmTabPane = observer(({ item }) => {
  return (
    <span>
      {item.renameMode ? (
        <input
          type="text"
          value={item.title}
          onKeyPress={(ev) => {
            if (ev.key === "Enter") {
              item.setRenameMode(false);
              return;
            }
          }}
          onChange={(ev) => {
            item.setTitle(ev.target.value);
          }}
        />
      ) : (
        item.title
      )}
      &nbsp;&nbsp;&nbsp;&nbsp;
      <Dropdown overlay={<DmPaneMenu item={item} />} trigger={["click"]}>
        <a
          href="#down"
          className="ant-dropdown-link"
          onClick={(e) => e.preventDefault()}
        >
          <DownOutlined />
        </a>
      </Dropdown>
    </span>
  );
});

const DmPaneContent = observer(({ item, data }) => {
  const columns = item.fieldsAsColumns;

  const [skipPageReset, setSkipPageReset] = React.useState(false);

  return (
    <div>
      <DmPanel item={item} />
      <Table
        columns={columns}
        data={data}
        item={item}
        skipPageReset={skipPageReset}
      />
    </div>
  );
});

const DmTabPaneWrapper = observer(({ store, data }) => {
  return (
    <Tabs
      onChange={(key) => {
        store.viewsStore.setSelected(key);
      }}
      activeKey={store.viewsStore.selected.key}
      type="editable-card"
      onEdit={store.viewsStore.addView}
    >
      {store.viewsStore.all.map((pane) => (
        <TabPane
          key={pane.key}
          closable={false}
          tab={<DmTabPane item={pane} data={data} />}
        >
          <DmPaneContent item={pane} data={data} />
        </TabPane>
      ))}
    </Tabs>
  );
});

const DmTabs = observer(({ store }) => {
  const mode = store.viewsStore.selected.target;
  const tasks = store.tasksStore;
  const data = mode === "annotations" ? tasks.annotationsData : tasks.data;
  return (
    <DmTabPaneWrapper
      store={store}
      data={Array.from(data)}
      mode={store.viewsStore.selected.target}
    />
  );
});

export default inject("store")(DmTabs);
