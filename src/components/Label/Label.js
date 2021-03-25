import { inject } from "mobx-react";
import React, { useCallback, useRef } from "react";
import { unmountComponentAtNode } from "react-dom";
import { FaCaretDown, FaChevronLeft, FaColumns } from "react-icons/fa";
import { Block, Elem } from "../../utils/bem";
import { Button } from "../Common/Button/Button";
import { FieldsButton } from "../Common/FieldsButton";
import { Icon } from "../Common/Icon/Icon";
import { Resizer } from "../Common/Resizer/Resizer";
import { Space } from "../Common/Space/Space";
import { DataView } from "../Table/Table";
import "./Label.styl";
import { Toolbar } from "./Toolbar/Toolbar";

const LabelingHeader = ({ SDK, onClick, isExplorerMode, children }) => {
  return (
    <Elem name="header" mod={{ labelStream: !isExplorerMode }}>
      <Space size="large">
        {SDK.interfaceEnabled("backButton") && (
          <Button
            icon={<FaChevronLeft style={{ marginRight: 4, fontSize: 16 }} />}
            type="link"
            onClick={onClick}
            style={{ fontSize: 18, padding: 0, color: "black" }}
          >
            Back
          </Button>
        )}

        {isExplorerMode ? (
          <FieldsButton
            wrapper={FieldsButton.Checkbox}
            icon={<Icon icon={FaColumns} />}
            trailingIcon={<Icon icon={FaCaretDown} />}
            title={"Fields"}
          />
        ) : null}
      </Space>

      {children}
    </Elem>
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
    const lsfRef = useRef();
    const history = SDK.lsf?.history;

    const [annotation, setAnnotation] = React.useState(
      SDK.lsf?.currentAnnotation
    );

    const closeLabeling = () => {
      store.closeLabeling();
    };

    React.useEffect(() => {
      const callback = (annotation) => setAnnotation(annotation);
      SDK.on("annotationSet", callback);

      return () => {
        if (lsfRef.current) {
          unmountComponentAtNode(lsfRef.current);
        }

        SDK.off("annotationSet", callback);
      };
    }, []);

    React.useEffect(() => {
      setAnnotation(SDK.lsf?.currentAnnotation);
    }, [SDK.lsf?.currentAnnotation?.id]);

    React.useEffect(() => {
      SDK.startLabeling(lsfRef.current);
    }, [task]);

    const onResize = useCallback((width) => {
      view.setLabelingTableWidth(width);
      // trigger resize events inside LSF
      window.dispatchEvent(new Event("resize"));
    }, []);

    const toolbar = (
      <Toolbar
        view={view}
        history={history}
        lsf={SDK.lsf?.lsf}
        annotation={annotation}
        isLabelStream={isLabelStreamMode}
        hasInstruction={!!SDK.lsf?.instruction}
      />
    );

    const header = (
      <LabelingHeader SDK={SDK} onClick={closeLabeling} isExplorerMode={isExplorerMode}>
        {!isExplorerMode && toolbar}
      </LabelingHeader>
    );

    return (
      <Block name="label-view">
        {!isExplorerMode && header}

        <Elem name="content">
          {isExplorerMode && (
            <Elem name="table">
              {isExplorerMode && header}
              <Elem
                tag={Resizer}
                name="dataview"
                minWidth={200}
                showResizerLine={false}
                maxWidth={window.innerWidth * 0.35}
                initialWidth={view.labelingTableWidth}
                onResizeFinished={onResize}
                style={{ display: "flex", flex: 1 }}
              >
                <DataView />
              </Elem>
            </Elem>
          )}

          <Elem name="lsf-wrapper" mod={{mode: isExplorerMode ? "explorer" : "labeling" }}>
            {isExplorerMode && toolbar}

            <Elem
              ref={lsfRef}
              id="label-studio-dm"
              name="lsf-container"
              key="label-studio"
            />
          </Elem>
        </Elem>
      </Block>
    );
  }
);
