import {
  CheckCircleOutlined,
  CheckOutlined,
  InfoCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Button, Space, Tooltip } from "antd";
import ButtonGroup from "antd/lib/button/button-group";
import { observer } from "mobx-react";
import React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { BiRedo, BiReset, BiUndo } from "react-icons/bi";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { FaBan } from "react-icons/fa";
import styled from "styled-components";

const TOOLTIP_DELAY = 0.8;

export const LabelToolbar = observer(
  ({ view, history, lsf, isLabelStream }) => {
    const completion = lsf?.completionStore?.selected;

    const task = view.dataStore.selected;

    const { viewingAllCompletions, viewingAllPredictions } =
      lsf?.completionStore ?? {};

    const viewAll = viewingAllCompletions || viewingAllPredictions;

    return lsf?.noTask === false && task ? (
      <Toolbar className="label-toolbar" isLabelStream={isLabelStream}>
        <CurrentTaskWrapper>
          <Space size="large">
            <div style={{ display: "flex", alignItems: "center" }}>
              <History history={history}>
                <div style={{ margin: history ? "0 10px" : 0 }}>
                  Task #{task.id}
                </div>
              </History>
            </div>

            {!viewAll && <LSFOperations history={completion?.history} />}
          </Space>
        </CurrentTaskWrapper>

        {!!lsf && !!completion && completion.type === "completion" && (
          <LabelActions>
            {!viewAll && (
              <SubmissionButtons
                lsf={lsf}
                completion={completion}
                isLabelStream={isLabelStream}
                disabled={lsf.isLoading}
              />
            )}

            <LabelTools>
              <Space>
                <Button
                  type={lsf.showingDescription ? "primary" : "dashed"}
                  ghost={lsf.showingDescription}
                  icon={<InfoCircleOutlined />}
                  onClick={() => lsf.toggleDescription()}
                />

                <Button
                  type="dashed"
                  icon={<SettingOutlined />}
                  onClick={() => lsf.toggleSettings()}
                />
              </Space>
            </LabelTools>
          </LabelActions>
        )}
      </Toolbar>
    ) : null;
  }
);

const LSFOperations = observer(({ history }) => {
  useHotkeys("ctrl+z,cmd+z", () => history?.undo(), { keyup: false }, [
    history,
  ]);
  useHotkeys(
    "ctrl+shift+z,cmd+shift+z",
    () => history?.redo(),
    { keyup: false },
    [history]
  );

  return history ? (
    <ButtonGroup>
      <Button
        className="flex-button"
        disabled={!history.canUndo}
        onClick={() => history.undo()}
      >
        <BiUndo size={18} />
      </Button>
      <Button
        className="flex-button"
        disabled={!history.canRedo}
        onClick={() => history.redo()}
      >
        <BiRedo size={18} />
      </Button>
      <Button
        className="flex-button"
        disabled={!history.canUndo}
        onClick={() => history.reset()}
      >
        <BiReset size={16} />
      </Button>
    </ButtonGroup>
  ) : null;
});

const SubmissionButtons = observer(
  ({ lsf, completion, isLabelStream, disabled }) => {
    const { userGenerate, sentUserGenerate } = completion;
    const isNewTask = userGenerate && !sentUserGenerate;

    const saveCompletion = React.useCallback(() => {
      if (!disabled) {
        isNewTask ? lsf.submitCompletion() : lsf.updateCompletion();
      }
    }, [disabled, isNewTask, lsf]);

    const skipTask = React.useCallback(() => {
      if (!disabled) {
        lsf.skipTask();
      }
    }, [disabled, lsf]);

    const buttons = [];

    buttons.push(
      <Tooltip
        key="skip"
        title="Mark task as cancelled: [ Ctrl+Space ]"
        mouseEnterDelay={TOOLTIP_DELAY}
      >
        <Button
          danger
          onClick={skipTask}
          disabled={disabled}
          icon={<FaBan style={{ marginRight: "7px", paddingTop: "2px" }} />}
        >
          Skip
        </Button>
      </Tooltip>
    );

    buttons.push(
      <Tooltip
        key="submit"
        title="Save results: [ Ctrl+Enter ]"
        mouseEnterDelay={TOOLTIP_DELAY}
      >
        <Button
          type="primary"
          disabled={disabled}
          icon={isNewTask ? <CheckOutlined /> : <CheckCircleOutlined />}
          onClick={saveCompletion}
        >
          {isNewTask || isLabelStream ? "Submit" : "Update"}
        </Button>
      </Tooltip>
    );

    useHotkeys("ctrl+enter,cmd+alt+enter", saveCompletion, { keyup: false }, [
      disabled,
    ]);
    useHotkeys("ctrl+space,cmd+alt+ ", skipTask, { keyup: false }, [disabled]);

    return <Space>{buttons}</Space>;
  }
);

const HistoryButton = ({ children, ...rest }) => (
  <Button {...rest} className="flex-button" shape="circle">
    {children}
  </Button>
);

/**
 *
 * @param {{root: HTMLElement, history: import("../../sdk/lsf-history").LSFHistory}} param0
 */
const History = observer(({ history, children }) => {
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
    <React.Fragment>
      <HistoryButton disabled={!canGoBack} onClick={() => history.goBackward()}>
        <BsArrowLeft />
      </HistoryButton>
      {children}
      <HistoryButton
        disabled={!canGoForward}
        onClick={() => history.goForward()}
      >
        <BsArrowRight />
      </HistoryButton>
    </React.Fragment>
  ) : (
    children
  );
});

const Toolbar = styled.div`
  top: 0;
  flex: 1em;
  z-index: 100;
  min-height: 32px;
  display: flex;
  position: sticky;
  align-items: center;
  padding: ${({ isLabelStream }) =>
    isLabelStream ? "0 0 0 1em" : "0 1em 13px"};
  justify-content: space-between;
  background-color: #fafafa;
`;

const CurrentTaskWrapper = styled.div``;

const LabelActions = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  padding-left: 10px;
`;

const LabelTools = styled.div`
  flex: 1;
  display: flex;
  max-width: 320px;
  margin-left: 20px;
  justify-content: flex-end;
`;
