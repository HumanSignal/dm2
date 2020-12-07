/* eslint-disable react-hooks/exhaustive-deps */

import { Button, PageHeader } from "antd";
import "label-studio/build/static/css/main.css";
import { inject, observer } from "mobx-react";
import React from "react";
import { FieldsButton } from "../Common/FieldsButton";
import { DataView } from "../Table/Table";
import { Styles } from "./Label.styles";
import { LabelButtons } from "./LabelButtons";
import { LabelToolbar } from "./LabelToolbar";

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

  const [completion, setCompletion] = React.useState(
    store.SDK.lsf?.currentCompletion
  );

  const closeLabeling = () => {
    store.unsetTask();
    store.SDK.setMode("explorer");
    store.SDK.destroyLSF();
    store.dataStore.reload();
  };

  React.useEffect(() => {
    const callback = (completion) => {
      console.log("Completion updated", completion);
      setCompletion(completion);
    };

    console.log("Attached to LSF");
    store.SDK.on("completionSet", callback);

    return () => {
      store.SDK.off("completionSet", callback);
    };
  }, []);

  React.useEffect(() => {
    console.log("Loading LSF");
    store.SDK.startLabeling(lsfRef.current, store.dataStore.selected);
  }, [store.dataStore.selected]);

  return (
    <Styles>
      <PageHeader
        title="Labeling"
        onBack={closeLabeling}
        style={{ padding: 0 }}
        tags={
          store.isExplorerMode ? (
            <div style={{ paddingLeft: 20 }}>
              <FieldsButton size="small" columns={view.targetColumns} />
            </div>
          ) : (
            []
          )
        }
      >
        {store.isExplorerMode && (
          <div className="table" style={{ maxWidth: "35vw" }}>
            <DataView
              key={`data-${view.target}`}
              view={view}
              columns={columns}
              data={Array.from(store.dataStore.list)}
              hiddenColumns={view.hiddenColumnsList}
            />
          </div>
        )}
        <div key="lsf-root" className="label-studio">
          <LabelToolbar
            view={view}
            history={history}
            lsf={store.SDK.lsf?.lsf}
            completion={completion}
            isLabelStream={store.isLabelStreamMode}
          />
          <div className="label-studio__content">
            <div id="label-studio" ref={lsfRef}></div>
            <History root={lsfRef} history={history} />
          </div>
        </div>
      </PageHeader>
    </Styles>
  );
});

export const Labeling = inject("store")(LabelingComponent);
