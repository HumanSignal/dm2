import React from "react";
import { observer, inject } from "mobx-react";

import { Pagination, Menu, Dropdown, Tabs, Button, Radio, Space } from "antd";
import {
  DownOutlined,
  PlayCircleOutlined,
  EyeOutlined,
  FilterOutlined,
  AppstoreOutlined,
  BarsOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";
import FieldsMenu from "./FieldsMenu";
import Table from "./Table";

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
        <Radio.Group value={item.type} onChange={e => item.setType(e.target.value)}>
          <Radio.Button value="list"><BarsOutlined /> List</Radio.Button>
          <Radio.Button value="grid"><AppstoreOutlined /> Grid</Radio.Button>
        </Radio.Group>

        <Radio.Group value={item.target} onChange={e => item.setTarget(e.target.value)}>
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
        <Button disabled={item.target === 'annotations'} onClick={() => item.root.setMode('label-ops') }>
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
            <a href="" onClick={(ev) => {
                ev.preventDefault();
                item.setRenameMode(true);
                return false;
            }}>Rename</a>
          </Menu.Item>
          <Menu.Item key="1">
            <a href="" onClick={(ev) => {
                ev.preventDefault();
                item.parent.duplicateView(item);
                return false;
            }}>Duplicate</a>
          </Menu.Item>
          <Menu.Divider />
        { item.parent.canClose ? <Menu.Item key="2" onClick={() => {
              item.parent.deleteView(item);
        }}>Close</Menu.Item> : null }
        </Menu>
    );
});

const DmTabPane = observer(({ item }) => {
  return (
    <span>
      {
          item.renameMode ?
              <input type="text" value={item.title}
                     onKeyPress={(ev) => {
                         if (ev.key === 'Enter') {
                             item.setRenameMode(false);
                             return;
                         }
                     }}
                     onChange={(ev) => {
                         item.setTitle(ev.target.value);
                     }} /> :
              item.title
      }
      &nbsp;&nbsp;&nbsp;&nbsp;
      <Dropdown overlay={<DmPaneMenu item={item} />} trigger={["click"]}>
        <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
          <DownOutlined />
        </a>
      </Dropdown>
    </span>
  );
});

const DmPaneContent = inject("store")(
  observer(({ item, store }) => {
    const columns = item.fieldsAsColumns;
      const data = (store.viewsStore.selected.target === 'annotations') ?
            store.tasksStore.getAnnotationData() :
            store.tasksStore.getData() ;

    const [skipPageReset, setSkipPageReset] = React.useState(false);

    return (
      <div>
          <DmPanel item={item} />
          <Table columns={columns} data={data} item={item} skipPageReset={skipPageReset} />
      </div>
    );
  })
);


const DmTabs = inject('store')(observer(({ store }) => {
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
                tab={<DmTabPane item={pane} />}
                key={pane.key}
                closable={false}                
              >
                <DmPaneContent item={pane} />
              </TabPane>
          ))}
        </Tabs>
    );
        
}));
    
    
//   class DmTabs extends React.Component {
//     constructor(props) {
//       super(props);
//       this.newTabIndex = 0;

//       const store = this.props.store;

//       const panes = store.viewsStore.all.map((c) => {
//         c["content"] = <DmPaneContent item={c} store={store} />;
//         return c;
//       });
        
//       this.state = {
//         activeKey: panes[0].key,
//         panes: panes,
//       };
//     }

//     onChange = (activeKey) => {
//       this.setState({ activeKey });
//     };

//     onEdit = (targetKey, action) => {
//       this[action](targetKey);
//     };

//     add = () => {
//       const { panes } = this.state;
//       const activeKey = `newTab${this.newTabIndex++}`;
//       panes.push({
//         title: "New Tab",
//         content: "Content of new Tab",
//         key: activeKey,
//       });
//       this.setState({ panes, activeKey });
//     };

//     remove = (targetKey) => {
//       let { activeKey } = this.state;
//       let lastIndex;
//       this.state.panes.forEach((pane, i) => {
//         if (pane.key === targetKey) {
//           lastIndex = i - 1;
//         }
//       });
//       const panes = this.state.panes.filter((pane) => pane.key !== targetKey);
//       if (panes.length && activeKey === targetKey) {
//         if (lastIndex >= 0) {
//           activeKey = panes[lastIndex].key;
//         } else {
//           activeKey = panes[0].key;
//         }
//       }
//       this.setState({ panes, activeKey });
//     };

//     render() {
//       return (
//         <Tabs
//           tabBarStyle={{ margin: 0, height: "40px" }}
//           onChange={this.onChange}
//           activeKey={this.state.activeKey}
//           type="editable-card"
//           onEdit={this.onEdit}
          
//         >
//           {this.state.panes.map((pane) => (
//             <TabPane
//               tab={<DmTabPane item={pane} />}
//               key={pane.key}
//               closable={false}
//             >
//               {pane.content}
//             </TabPane>
//           ))}
//         </Tabs>
//       );
//     }
//   }
// ));

export default DmTabs;
