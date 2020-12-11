/* eslint-disable react-hooks/exhaustive-deps */

import { PageHeader } from "antd";
import "label-studio/build/static/css/main.css";
import { inject, observer } from "mobx-react";
import React from "react";
import { FieldsButton } from "../Common/FieldsButton";
import { DataView } from "../Table/Table";
import { LabelStudioContent, LabelStudioWrapper, Styles } from "./Label.styles";
import { LabelToolbar } from "./LabelToolbar";

/**
 * @param {{store: import("../../stores/AppStore").AppStore}} param1
 */
const LabelingComponent = observer(({ store }) => {
  const lsfRef = React.createRef();
  const view = store.viewsStore.selected;
  const history = store.SDK.lsf?.history;
  const columns = React.useMemo(() => view.fieldsAsColumns, [
    view,
    view.target,
  ]);

  const [completion, setCompletion] = React.useState(
    store.SDK.lsf?.currentCompletion
  );

  const closeLabeling = () => view.closeLabeling();

  React.useEffect(() => {
    const callback = (completion) => setCompletion(completion);
    store.SDK.on("completionSet", callback);

    return () => store.SDK.off("completionSet", callback);
  }, []);

  React.useEffect(() => {
    setCompletion(store.SDK.lsf?.currentCompletion);
  }, [store.SDK.lsf?.currentCompletion?.id]);

  React.useEffect(() => {
    store.SDK.startLabeling(lsfRef.current, store.dataStore.selected);
  }, [store.dataStore.selected]);

  return (
    <Styles>
      <PageHeader
        title="Back"
        onBack={closeLabeling}
        style={{ padding: 0 }}
        tags={
          store.isExplorerMode ? (
            <div style={{ paddingLeft: 20 }}>
              <FieldsButton columns={view.targetColumns} />
            </div>
          ) : (
            []
          )
        }
      >
        {store.isExplorerMode && (
          <div className="table" style={{ maxWidth: "35vw" }}>
            <DataView />
          </div>
        )}

        <LabelStudioWrapper>
          <LabelToolbar
            view={view}
            history={history}
            lsf={store.SDK.lsf?.lsf}
            completion={completion}
            isLabelStream={store.isLabelStreamMode}
          />
          <LabelStudioContent id="label-studio" ref={lsfRef} />
        </LabelStudioWrapper>
      </PageHeader>
    </Styles>
  );
});

export const Labeling = inject("store")(LabelingComponent);
