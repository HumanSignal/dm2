import { inject } from "mobx-react";
import React from "react";
import { FaCaretDown, FaChevronLeft, FaColumns } from "react-icons/fa";
import { Block, Elem } from "../../utils/bem";
import { History } from "../../utils/history";
import { Button } from "../Common/Button/Button";
import { FieldsButton } from "../Common/FieldsButton";
import { Icon } from "../Common/Icon/Icon";
import { Resizer } from "../Common/Resizer/Resizer";
import { Space } from "../Common/Space/Space";
import { DataView } from "../Table/Table";
import "./Label.styl";
import { Toolbar } from "./Toolbar/Toolbar";

const LabelingHeader = ({ onClick, isExplorerMode, children }) => {
  return (
    <Elem name="header" mod={{ labelStream: !isExplorerMode }}>
      <Space>
        <Button
          icon={<FaChevronLeft style={{ marginRight: 4, fontSize: 16 }} />}
          type="link"
          onClick={onClick}
          style={{ fontSize: 18, padding: 0, color: "black" }}
        >
          Back
        </Button>

        {isExplorerMode ? (
          <div style={{ paddingLeft: 20 }}>
            <FieldsButton
              wrapper={FieldsButton.Checkbox}
              icon={<Icon icon={FaColumns} />}
              trailingIcon={<Icon icon={FaCaretDown} />}
              title={"Fields"}
            />
          </div>
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
      console.log("Starting labeling");
      SDK.startLabeling(lsfRef.current);
    }, [task]);

    const onResize = (width) => {
      view.setLabelingTableWidth(width);
      // trigger resize events inside LSF
      window.dispatchEvent(new Event("resize"));
    };

    const toolbar = (
      <Toolbar
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

          <Elem name="lsf-wrapper">
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
