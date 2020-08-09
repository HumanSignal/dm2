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
              const ts = store.tasksStore;
              if (! task) {
                  task = ts.getTask() || data[0];
              }

              ts.setTask(task);
              if (!window.LabelStudio) return setTimeout(() => runLS(task), 100);
              const lsf = window.LabelStudio('label-studio', { config, interfaces, user, task });

              ts.setLSF(lsf);
          }, []) :
          React.useCallback((task, taskOrig, value) => {
              const ts = store.tasksStore;
              if (! task) {
                  task = ts.getTask() || data[0];
              }
              
              ts.setTask(task);
              store.operationsStore.loadOps(task);
              const lsf = LSF('label-studio', config, task.id,
                              store.tasksStore.buildLSFCallbacks());

              ts.setLSF(lsf);
          });
    
    // const runLS = React.useCallback(task => {
    //   if (!window.LabelStudio) return setTimeout(() => runLS(task), 100);
    //     new window.LabelStudio('label-studio', { config, interfaces, user, task });
    // }, []);

    React.useEffect(() => { runLS(); }, [runLS]);
    
    return (
        <div>
          <link href="https://unpkg.com/label-studio@0.7.3/build/static/css/main.09b8161e.css" rel="stylesheet" />

          <div style={{ display: "flex", height: "100%" }}>

            <div style={{ flex: "1 0 400px", marginRight: "1em", display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ paddingBottom: "2.2em", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ paddingLeft: "1em" }}>
                  <a href="" onClick={ev => { ev.preventDefault(); store.setMode('dm'); return false; } }>
                    <LeftOutlined /> Back 
                  </a>
                </div>
                <div>
                  <Button type={store.mode === "label-table" ? "primary" : ""}
                          onClick={ev => store.setMode('label-table') }>
                    Tasks<sup>[t]</sup>
                  </Button> &nbsp;
                  <Button type={store.mode === "label-ops" ? "primary" : ""}
                          onClick={ev => store.setMode('label-ops') }>
                    LabelOps<sup>[l]</sup>
                  </Button>
                </div>
              </div>
              <div style={{ minWidth: "330px", minHeight: "1px" }}>
                <div style={{ display: (store.mode === "label-table") ? "flex": "none", flexDirection: "column", height: "100%" }}><Table columns={columns} data={data} item={item} onSelectRow={runLS} /></div>
                <div style={{ display: (store.mode === "label-ops") ? "block": "none" }}><LabelOps store={store} /></div>
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
