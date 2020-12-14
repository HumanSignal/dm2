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
import { BiRedo, BiReset, BiUndo } from "react-icons/bi";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import styled from "styled-components";

const TOOLTIP_DELAY = 0.8;

export const LabelToolbar = observer(
  ({ view, history, completion, lsf, isLabelStream }) => {
    const task = view.dataStore.selected;
    return task ? (
      <Toolbar>
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

        {!!lsf && !!completion && (
          <LabelActions>
            <SubmissionButtons
              lsf={lsf}
              completion={completion}
              isLabelStream={isLabelStream}
              disabled={lsf.isLoading}
            />

            <LabelTools>
              <Space
                style={{
                  width: "100%",
                  justifyContent: "flex-end",
                  paddingRight: "10px",
                }}
              >
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
    const submitFunction = isNewTask
      ? lsf.submitCompletion
      : lsf.updateCompletion;

    const buttons = [];

    buttons.push(
      <Tooltip
        key="skip"
        title="Mark task as cancelled: [ Ctrl+Space ]"
        mouseEnterDelay={TOOLTIP_DELAY}
      >
        <Button danger onClick={lsf.skipTask} disabled={disabled}>
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
          onClick={submitFunction}
        >
          {isNewTask || isLabelStream ? "Submit" : "Update"}
        </Button>
      </Tooltip>
    );

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
  flex: 0;
  z-index: 100;
  display: flex;
  position: sticky;
  padding-left: 15px;
  align-items: center;
  padding-bottom: 10px;
  justify-content: space-between;
  background-color: #fff;
`;

const CurrentTaskWrapper = styled.div``;

const LabelActions = styled.div`
  display: flex;
`;

const LabelTools = styled.div`
  width: 320px;
  margin-left: 20px;
`;
