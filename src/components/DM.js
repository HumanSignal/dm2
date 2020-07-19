import React from "react";
import { observer, inject } from "mobx-react";

import { Pagination, Menu, Dropdown, Tabs, Button } from "antd";
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
      <div>
        <Button
          disabled={item.type === "list"}
          onClick={() => item.setType("list")}
        >
          <BarsOutlined />
          List
        </Button>
        <Button
          disabled={item.type === "grid"}
          onClick={() => item.setType("grid")}
        >
          <AppstoreOutlined />
          Grid
        </Button>
        &nbsp;&nbsp;
        <Button
          disabled={item.target === "tasks"}
          onClick={() => item.setTarget("tasks")}
        >
          Tasks
        </Button>
        <Button
          disabled={item.target === "annotations"}
          onClick={() => item.setTarget("annotations")}
        >
          Annotations
        </Button>
        &nbsp;&nbsp;
        <Dropdown overlay={<FieldsMenu item={item} />}>
          <Button>
            <EyeOutlined /> Fields <CaretDownOutlined />
          </Button>
        </Dropdown>
        &nbsp;
        <Button
          type={item.enableFilters ? "primary" : ""}
          onClick={() => item.toggleFilters()}
        >
          <FilterOutlined /> Filters{" "}
        </Button>
        &nbsp;
      </div>
      <div>
        <Button onClick={() => item.root.setMode('label') }>
          <PlayCircleOutlined />
          Label All
        </Button>
        &nbsp;
        <Dropdown overlay={actionsMenu}>
          <Button>
            Actions <CaretDownOutlined />
          </Button>
        </Dropdown>
      </div>
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
      const data = store.tasksStore.getData();

    const [skipPageReset, setSkipPageReset] = React.useState(false);

    return (
      <div>
        <div style={{ background: "white" }}>
          <DmPanel item={item} />
        </div>
        <div style={{ background: "#f1f1f1" }}>
          <Table columns={columns} data={data} item={item} skipPageReset={skipPageReset} />
        </div>
      </div>
    );
  })
);


const DmTabs = inject('store')(observer(({ store }) => {
    const panes = store.viewsStore.all.map((c) => {
        c["content"] = <DmPaneContent item={c} store={store} />;
        return c;
    });
      
    return (
        <Tabs
          onChange={(key) => {
              store.viewsStore.setSelected(key);
          }}
          activeKey={store.viewsStore.selected.key}
          type="editable-card"
          onEdit={store.viewsStore.addView}          
        >
          {panes.map((pane) => (
              <TabPane
                tab={<DmTabPane item={pane} />}
                key={pane.key}
                closable={false}                
              >
                {pane.content}
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
