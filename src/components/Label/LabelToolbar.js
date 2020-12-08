import { CheckCircleOutlined, CheckOutlined } from "@ant-design/icons";
import { Button, Space, Tooltip } from "antd";
import ButtonGroup from "antd/lib/button/button-group";
import { observer } from "mobx-react";
import React from "react";
import { BiRedo, BiReset, BiUndo } from "react-icons/bi";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import styled from "styled-components";
import { Hint } from "./Label.styles";

const TOOLTIP_DELAY = 0.8;

export const LabelToolbar = observer(
  ({ view, history, completion, lsf, isLabelStream }) => {
    const task = view.dataStore.selected;
    return task ? (
      <Toolbar style={{ paddingRight: 340 }}>
        <CurrentTaskWrapper>
          <Space size="large">
            <div style={{ display: "flex", alignItems: "center" }}>
              <History history={history}>
                <div style={{ margin: history ? "0 10px" : 0 }}>
                  Task #{task.id}
                </div>
              </History>
            </div>

            <LSFOperations history={completion?.history} />
          </Space>
        </CurrentTaskWrapper>

        <LabelActions>
          {!!lsf && !!completion && (
            <SubmissionButtons
              lsf={lsf}
              completion={completion}
              isLabelStream={isLabelStream}
            />
          )}
        </LabelActions>
      </Toolbar>
    ) : null;
  }
);

const LSFOperations = observer(({ history }) => {
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
      <Button className="flex-button" onClick={() => history.reset()}>
        <BiReset size={16} />
      </Button>
    </ButtonGroup>
  ) : null;
});

const SubmissionButtons = observer(({ lsf, completion, isLabelStream }) => {
  const { userGenerate, sentUserGenerate, versions } = completion;
  const { enableHotkeys, enableTooltips } = lsf.settings;

  const buttons = [];

  if (enableHotkeys && enableTooltips) {
    buttons.submit = <Hint> [ Ctrl+Enter ]</Hint>;
    buttons.skip = <Hint> [ Ctrl+Space ]</Hint>;
    buttons.update = <Hint> [ Alt+Enter] </Hint>;
  }

  if (isLabelStream) {
    buttons.push(
      <Tooltip
        key="skip"
        title="Reject task: [ Ctrl+Space ]"
        mouseEnterDelay={TOOLTIP_DELAY}
      >
        <Button onClick={lsf.skipTask} danger>
          Reject {buttons.skip}
        </Button>
      </Tooltip>
    );
  }

  if ((userGenerate && !sentUserGenerate) || (lsf.explore && !userGenerate)) {
    buttons.push(
      <Tooltip
        key="submit"
        title="Save results: [ Ctrl+Enter ]"
        mouseEnterDelay={TOOLTIP_DELAY}
      >
        <Button
          type="primary"
          icon={<CheckOutlined />}
          onClick={lsf.submitCompletion}
        >
          {isLabelStream ? "Submit & Next" : "Submit"} {buttons.submit}
        </Button>
      </Tooltip>
    );
  } else if ((userGenerate && sentUserGenerate) || !sentUserGenerate) {
    buttons.push(
      <Tooltip
        key="update"
        title="Update this task: [ Alt+Enter ]"
        mouseEnterDelay={TOOLTIP_DELAY}
      >
        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={lsf.updateCompletion}
        >
          {sentUserGenerate || versions.result ? "Update" : "Submit"}{" "}
          {buttons.update}
        </Button>
      </Tooltip>
    );
  }

  return <Space>{buttons}</Space>;
});

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
  flex: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
`;
const CurrentTaskWrapper = styled.div``;
const LabelActions = styled.div``;
