/* eslint-disable react-hooks/exhaustive-deps */

import { Button } from "antd";
import "label-studio/build/static/css/main.css";
import { inject, observer } from "mobx-react";
import React from "react";
import { Table } from "../Table/Table";
import { Styles } from "./Label.styles";
import { LabelButtons } from "./LabelButtons";

/**
 *
 * @param {{root: HTMLElement, history: import("../../sdk/lsf-history").LSFHistory}} param0
 */
const History = ({ root, history }) => {
  const [canGoBack, setGoBack] = React.useState(false);
  const [canGoForward, setGoForward] = React.useState(false);
  const [renderable, setRenderable] = React.useState(false);

  React.useEffect(() => {
    if (history) {
      history.onChange(() => {
        setGoBack(history.canGoBack);
        setGoForward(history.canGoForward);
      });
      setRenderable(true);
    }
  }, [history]);

  return renderable ? (
    <LabelButtons root={root}>
      <Button disabled={!canGoBack} onClick={() => history.goBackward()}>
        Prev
      </Button>
      <Button disabled={!canGoForward} onClick={() => history.goForward()}>
        Next
      </Button>
    </LabelButtons>
  ) : null;
};

/**
 * @param {{store: import("../../stores/AppStore").AppStore}} param1
 */
const LabelingComponent = observer(({ store }) => {
  const lsfRef = React.createRef();
  const view = store.viewsStore.selected;
  const history = store.SDK.lsf?.history;
  const columns = React.useMemo(() => {
    return view.fieldsAsColumns;
  }, [view, view.target]);

  const runLS = () => {
    console.log("Loading LSF");
    store.SDK.startLabeling(lsfRef.current, store.dataStore.selected);
  };

  const closeLabeling = () => {
    store.unsetTask();
    store.SDK.destroyLSF();
  };

  React.useEffect(runLS, [store.dataStore.selected]);

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
              key={`data-${view.target}`}
              view={view}
              columns={columns}
              data={Array.from(store.dataStore.list)}
              hiddenColumns={view.hiddenColumnsList}
            />
          </div>
        )}
        <div key="lsf-root" className="label-studio">
          <div id="label-studio" ref={lsfRef}></div>

          <History root={lsfRef} history={history} />
        </div>
      </div>
    </Styles>
  );
});

export const Labeling = inject("store")(LabelingComponent);
