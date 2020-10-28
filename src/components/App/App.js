import { observer, Provider } from "mobx-react";
import React from "react";
import DmLabel from "../Label/Label";
import { TabsWrapper } from "../Tabs/tabs";
import Styles from "./App.styles";
import "./index.scss";

/** @typedef {import("../../stores/AppStore").AppStore} AppStore */

/**
 * Main Component
 * @param {{app: AppStore} param0
 */
const AppComponent = ({ app }) => {
  const labeling = app.isLabelStreamMode || app.tasksStore.task !== undefined;
  return (
    <Provider store={app}>
      <Styles fullScreen={labeling}>
        {labeling ? <DmLabel /> : <TabsWrapper />}
      </Styles>
    </Provider>
  );
};

export const App = observer(AppComponent);
