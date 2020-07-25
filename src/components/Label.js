import React from "react";
import { observer, inject } from "mobx-react";

import { Button } from "antd";

import Table from "./Table";
import LabelOps from "./LabelOps/LabelOps";

import { LeftOutlined } from "@ant-design/icons";

import LSF from "../utils/lsf";

const user = { pk: 1, firstName: "James", lastName: "Dean" };
const interfaces = [
  "panel",
  "update",
  "controls",
  "side-column",
  "completions:menu",
  "completions:add-new",
  "completions:delete",
  "predictions:menu",
];

const DmLabel = inject('store')(observer(({ store }) => {
    const item = store.viewsStore.selected;
    const columns = item.fieldsAsColumns;
    const data = store.tasksStore.getData();
    const config = store._config;
    
    const runLS = store._mode === 'dev' ?
          React.useCallback(task => {
              store.tasksStore.setTask(task);
              if (!window.LabelStudio) return setTimeout(() => runLS(task), 100);
              new window.LabelStudio('label-studio', { config, interfaces, user, task });
          }, []) :
          React.useCallback(task => {
              store.tasksStore.setTask(task);
              LSF('label-studio', config, task,
                  store.tasksStore.buildLSFCallbacks());
          });
    
    // const runLS = React.useCallback(task => {
    //   if (!window.LabelStudio) return setTimeout(() => runLS(task), 100);
    //     new window.LabelStudio('label-studio', { config, interfaces, user, task });
    // }, []);

    React.useEffect(() => runLS(data[0]), [runLS]);
    
    return (
        <div>
          <link href="https://unpkg.com/label-studio@0.7.3/build/static/css/main.09b8161e.css" rel="stylesheet" />

          
          <div style={{ display: "flex" }}>

            <div style={{ flex: "200px 0 0", marginRight: "1em" }}>
              <div style={{ paddingBottom: "2.2em", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                <a href="" onClick={ev => { ev.preventDefault(); store.setMode('dm'); return false; } }>
                  <LeftOutlined /> Back 
                </a>
                </div>
                <div>
                  <Button type={store.mode === "label-table" ? "primary" : ""} onClick={ev => store.setMode('label-table') }>Tasks</Button> &nbsp;
                  <Button type={store.mode === "label-ops" ? "primary" : ""} onClick={ev => store.setMode('label-ops') }>LabelOps</Button>
                </div>
              </div>
              <div style={{ minWidth: "330px" }}>
                { store.mode === "label-table" ? <Table columns={columns} data={data} item={item} onSelectRow={runLS} /> : null }
                { store.mode === "label-ops" ? <LabelOps store={store} /> : null }
              </div>
            </div>
            
              
            
            <div style={{ width: "100%" }}>
              <div id="label-studio"></div>
            </div>
          </div>
          
        </div>
    );        
}));

export default DmLabel;
