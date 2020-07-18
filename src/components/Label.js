import React from "react";
import { observer, inject } from "mobx-react";

import { Button } from "antd";

import Table from "./Table";

import data from '../data/tasks.json';

const DmLabel = inject('store')(observer(({ store }) => {
    const item = store.viewsStore.labelingView;
    const columns = item.fieldsAsColumns;
    
    return (
        <div>
          <Button onClick={() => store.setMode('dm') }>
            Back to Table
          </Button>

          <div style={{ display: "flex" }}>
            <div style={{ width: "200px" }}><Table columns={columns} data={data} item={item} /></div>
            <div>
              Label Studio here...
            </div>
          </div>
          
        </div>
    );        
}));

export default DmLabel;
