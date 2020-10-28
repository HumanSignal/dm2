/* eslint-disable react-hooks/exhaustive-deps */

import { Button } from "antd";
import "label-studio/build/static/css/main.css";
import { inject, observer } from "mobx-react";
import React from "react";
import { Table } from "../Table/Table";
import { Styles } from "./Label.styles";

const DmLabel = inject("store")(
  observer(({ store }) => {
    const lsfRef = React.createRef();
    const item = store.viewsStore.selected;
    const columns = item.fieldsAsColumns;
    const data = store.tasksStore.data;

    const runLS = () => {
      store.SDK.startLabeling(lsfRef.current, store.tasksStore.task);
    };

    const closeLabeling = () => {
      store.tasksStore.unsetTask();
      store.SDK.destroyLSF();
    };

    React.useEffect(runLS, [store.tasksStore.task]);

    return (
      <Styles>
        {store.isExplorerMode && (
          <div className="navigation">
            <Button onClick={closeLabeling}>Back to Table</Button>
          </div>
        )}

        <div className="wrapper">
          {store.isExplorerMode && (
            <div className="table">
              <Table
                columns={columns}
                data={data}
                item={item}
                onSelectRow={() => {}}
              />
            </div>
          )}
          <div key="lsf-root" className="label-studio">
            <div id="label-studio" ref={lsfRef}></div>
          </div>
        </div>
      </Styles>
    );
  })
);

export default DmLabel;
