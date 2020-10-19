import { Button } from "antd";
import { inject, observer } from "mobx-react";
import React from "react";
import LSF from "../utils/lsf";
import Table from "./Table/Table";

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

const DmLabel = inject("store")(
  observer(({ store }) => {
    const item = store.viewsStore.selected;
    const columns = item.fieldsAsColumns;
    const data = store.tasksStore.getData();
    const config = store._config;

    const runLS =
      store._mode === "dev"
        ? React.useCallback(
            (task) => {
              store.tasksStore.setTask(task);
              if (!window.LabelStudio)
                return setTimeout(() => runLS(task), 100);
              new window.LabelStudio("label-studio", {
                config,
                interfaces,
                user,
                task,
              });
            },
            [config, runLS, store.tasksStore]
          )
        : React.useCallback((task) => {
            store.tasksStore.setTask(task);
            LSF(
              "label-studio",
              config,
              task,
              store.tasksStore.buildLSFCallbacks()
            );
          });

    // const runLS = React.useCallback(task => {
    //   if (!window.LabelStudio) return setTimeout(() => runLS(task), 100);
    //     new window.LabelStudio('label-studio', { config, interfaces, user, task });
    // }, []);

    React.useEffect(() => runLS(data[0]), [data, runLS]);

    return (
      <div>
        <link
          href="https://unpkg.com/label-studio@0.7.3/build/static/css/main.09b8161e.css"
          rel="stylesheet"
        />

        <Button onClick={() => store.setMode("dm")}>Back to Table</Button>

        <div style={{ display: "flex" }}>
          <div style={{ flex: "200px 0 0", marginRight: "1em" }}>
            <Table
              columns={columns}
              data={data}
              item={item}
              onSelectRow={runLS}
            />
          </div>
          <div style={{ width: "100%" }}>
            <div id="label-studio"></div>
          </div>
        </div>
      </div>
    );
  })
);

export default DmLabel;
