
import React from 'react';
import { observer, Provider } from "mobx-react";

import DmTabs from './DM';
import DmLabel from './Label';

import Styles from './Table.styles';

const App = (observer(({ app }) => {
    return (
        <Provider store={app}>
          <Styles>
            { app.mode === 'dm' ? <DmTabs /> : <DmLabel /> }
          </Styles>
        </Provider>
    );
}));

export default App;
