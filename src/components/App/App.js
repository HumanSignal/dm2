import { observer, Provider } from "mobx-react";
import React from "react";
import DmLabel from "../Label/Label";
import { TabsWrapper } from "../Tabs/tabs";
import Styles from "./App.styles";
import "./index.scss";

const App = observer(({ app }) => {
  const labeling = app.tasksStore.task !== undefined;
  return (
    <Provider store={app}>
      <Styles fullScreen={labeling}>
        {labeling ? <DmLabel /> : <TabsWrapper />}
      </Styles>
    </Provider>
  );
});

export default App;
