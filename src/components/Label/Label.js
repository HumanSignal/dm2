/* eslint-disable react-hooks/exhaustive-deps */

import { CaretDownOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Space } from "antd";
import { inject } from "mobx-react";
import React from "react";
import { FaChevronLeft } from "react-icons/fa";
import { History } from "../../utils/history";
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

const injector = inject(({ store }) => {
  return {
    store,
    view: store.viewsStore?.selected,
    task: store.dataStore?.selected,
    isLabelStreamMode: store.isLabelStreamMode,
    isExplorerMode: store.isExplorerMode,
    SDK: store.SDK,
  };
});

/**
 * @param {{store: import("../../stores/AppStore").AppStore}} param1
 */
export const Labeling = injector(
  ({ store, view, task, SDK, isLabelStreamMode, isExplorerMode }) => {
    const lsfRef = React.createRef();
    const history = SDK.lsf?.history;

    const [completion, setCompletion] = React.useState(
      SDK.lsf?.currentCompletion
    );

    const closeLabeling = () => {
      store.closeLabeling();
      History.forceNavigate({ tab: view.id });
    };

    React.useEffect(() => {
      const callback = (completion) => setCompletion(completion);
      SDK.on("completionSet", callback);

      return () => SDK.off("completionSet", callback);
    }, []);

    React.useEffect(() => {
      setCompletion(SDK.lsf?.currentCompletion);
    }, [SDK.lsf?.currentCompletion?.id]);

    React.useEffect(() => {
      SDK.startLabeling(lsfRef.current, task);
    }, [lsfRef, task]);

    const onResize = (width) => {
      view.setLabelingTableWidth(width);
      // trigger resize events inside LSF
      window.dispatchEvent(new Event("resize"));
    };

    const toolbar = (
      <LabelToolbar
        view={view}
        history={history}
        lsf={SDK.lsf?.lsf}
        completion={completion}
        isLabelStream={isLabelStreamMode}
      />
    );

    const header = (
      <LabelingHeader onClick={closeLabeling} isExplorerMode={isExplorerMode}>
        {!isExplorerMode && toolbar}
      </LabelingHeader>
    );

    return (
      <Styles>
        {!isExplorerMode && header}

        <LabelContent className="label-content">
          {isExplorerMode && (
            <div
              className="table label-table"
              style={{ marginTop: "-1em", paddingTop: "1em" }}
            >
              {isExplorerMode && header}
              <DataViewWrapper
                className="label-dataview-wrapper"
                style={{
                  flex: 1,
                  display: "flex",
                  width: "100%",
                }}
                minWidth={200}
                showResizerLine={false}
                maxWidth={window.innerWidth * 0.35}
                initialWidth={view.labelingTableWidth}
                onResizeFinished={onResize}
              >
                <DataView />
              </DataViewWrapper>
            </div>
          )}

          <LabelStudioWrapper className="label-wrapper">
            {isExplorerMode && toolbar}

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
  }
);
