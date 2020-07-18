import React from "react";
import { observer, inject } from "mobx-react";

import { Button } from "antd";

import Table from "./Table";

import data from '../data/tasks.json';
import config from '../data/config';

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
    const item = store.viewsStore.labelingView;
    const columns = item.fieldsAsColumns;

    const runLS = React.useCallback(task => {
      if (!window.LabelStudio) return setTimeout(() => runLS(task), 100);
      new window.LabelStudio('label-studio', { config, interfaces, user, task });
    }, []);

    React.useEffect(() => runLS(data[0]), [runLS]);
    
    return (
        <div>
          <link href="https://unpkg.com/label-studio@0.7.3/build/static/css/main.09b8161e.css" rel="stylesheet" />

          <Button onClick={() => store.setMode('dm') }>
            Back to Table
          </Button>

          <div style={{ display: "flex" }}>
            <div style={{ flex: "200px 0 0", marginRight: "1em" }}><Table columns={columns} data={data} item={item} /></div>
            <div>
              <div id="label-studio"></div>
            </div>
          </div>
          
        </div>
    );        
}));

export default DmLabel;
