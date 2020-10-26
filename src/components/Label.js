/* eslint-disable react-hooks/exhaustive-deps */

import { Button } from "antd";
import "label-studio/build/static/css/main.css";
import { inject, observer } from "mobx-react";
import React from "react";
import { Table } from "./Table/Table";

const DmLabel = inject("store")(
  observer(({ store }) => {
    const lsfRef = React.createRef();
    const item = store.viewsStore.selected;
    const columns = item.fieldsAsColumns;
    const data = store.tasksStore.data;

    const runLS = () => {
      if (store.tasksStore.task) {
        store.SDK.startLabeling(
          lsfRef.current,
          store.tasksStore.task,
          store.project.label_config_line
        );
      }
    };

    const closeLabeling = () => {
      store.tasksStore.unsetTask();
      store.SDK.destroyLSF();
    };

    React.useEffect(runLS, [store.tasksStore.task]);

    return (
      <>
        <Button onClick={closeLabeling}>Back to Table</Button>

        <div style={{ display: "flex", alignItems: "stretch" }}>
          <div style={{ flex: "200px 0 0", marginRight: "1em" }}>
            <Table
              columns={columns}
              data={data}
              item={item}
              onSelectRow={() => {}}
            />
          </div>
          <div key="lsf-root" style={{ width: "100%", overflow: "auto" }}>
            <div id="label-studio" ref={lsfRef}></div>
          </div>
        </div>
      </>
    );
  })
);

export default DmLabel;
