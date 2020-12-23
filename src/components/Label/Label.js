/* eslint-disable react-hooks/exhaustive-deps */

import { CaretDownOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Space } from "antd";
import "label-studio/build/static/css/main.css";
import { inject, observer } from "mobx-react";
import React from "react";
import { FaChevronLeft } from "react-icons/fa";
import { FieldsButton } from "../Common/FieldsButton";
import { DataView } from "../Table/Table";
import {
  DataViewWrapper,
  LabelContent,
  LabelHeader,
  LabelStudioContent,
  LabelStudioWrapper,
  Styles,
} from "./Label.styles";
import { LabelToolbar } from "./LabelToolbar";

const LabelingHeader = ({ onClick, isExplorerMode, children }) => {
  return (
    <LabelHeader className="label-header">
      <Space>
        <Button
          icon={<FaChevronLeft style={{ marginRight: 4, fontSize: 16 }} />}
          type="link"
          onClick={onClick}
          className="flex-button"
          style={{ fontSize: 18, padding: 0, color: "black" }}
        >
          Back
        </Button>

        {isExplorerMode ? (
          <div style={{ paddingLeft: 20 }}>
            <FieldsButton
              wrapper={FieldsButton.Checkbox}
              icon={<EyeOutlined />}
              trailingIcon={<CaretDownOutlined />}
              title={"Fields"}
            />
          </div>
        ) : null}
      </Space>

      {children}
    </LabelHeader>
  );
};

/**
 * @param {{store: import("../../stores/AppStore").AppStore}} param1
 */
const LabelingComponent = observer(({ store }) => {
  const lsfRef = React.createRef();
  const view = store.viewsStore.selected;
  const history = store.SDK.lsf?.history;

  const [completion, setCompletion] = React.useState(
    store.SDK.lsf?.currentCompletion
  );

  const closeLabeling = () => store.closeLabeling();

  React.useEffect(() => {
    const callback = (completion) => setCompletion(completion);
    store.SDK.on("completionSet", callback);

    return () => store.SDK.off("completionSet", callback);
  }, []);

  React.useEffect(() => {
    setCompletion(store.SDK.lsf?.currentCompletion);
  }, [store.SDK.lsf?.currentCompletion?.id]);

  React.useEffect(() => {
    console.log(lsfRef.current);
    store.SDK.startLabeling(lsfRef.current, store.dataStore.selected);
  }, [lsfRef, store.dataStore.selected]);

  const toolbar = (
    <LabelToolbar
      view={view}
      history={history}
      lsf={store.SDK.lsf?.lsf}
      completion={completion}
      isLabelStream={store.isLabelStreamMode}
    />
  );

  const header = (
    <LabelingHeader
      onClick={closeLabeling}
      isExplorerMode={store.isExplorerMode}
    >
      {!store.isExplorerMode && toolbar}
    </LabelingHeader>
  );

  return (
    <Styles>
      {!store.isExplorerMode && header}

      <LabelContent className="label-content">
        {store.isExplorerMode && (
          <div
            className="table label-table"
            style={{ marginTop: "-1em", paddingTop: "1em" }}
          >
            {store.isExplorerMode && header}
            <DataViewWrapper
              className="label-dataview-wrapper"
              style={{
                flex: 1,
                display: "flex",
                width: "100%",
              }}
              minWidth={200}
              maxWidth={window.innerWidth * 0.35}
              initialWidth={view.labelingTableWidth}
              onResizeFinished={(width) => view.setLabelingTableWidth(width)}
            >
              <DataView />
            </DataViewWrapper>
          </div>
        )}

        <LabelStudioWrapper className="label-wrapper">
          {store.isExplorerMode && toolbar}

          <LabelStudioContent
            ref={lsfRef}
            key="label-studio"
            id="label-studio-dm"
            className="label-studio"
          />
        </LabelStudioWrapper>
      </LabelContent>
    </Styles>
  );
});

export const Labeling = inject("store")(LabelingComponent);
