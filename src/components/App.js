
import React from 'react';
import { Provider } from "mobx-react";

import DmTabs from './DM';
import Styles from './Table.styles';

function App({ app }) {
    return (
        <Provider store={app}>
          <Styles>
            <DmTabs />
          </Styles>
        </Provider>
    );
}

export default App;
