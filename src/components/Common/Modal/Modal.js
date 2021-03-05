import React from "react";
import { render } from "react-dom";
import { cn } from "../../../utils/bem";
import { Button } from "../Button/Button";
import { Space } from "../Space/Space";
import { Modal } from "./ModalPopup";

const standaloneModal = (props) => {
  const modalRef = React.createRef();
  const rootDiv = document.createElement("div");
  rootDiv.className = cn("modal-holder").toClassName();

  document.body.appendChild(rootDiv);

  const renderModal = (props) => {
    render(
      <Modal
        ref={modalRef}
        {...props}
        animateAppearance
        onHidden={() => {
          props.onHidden?.();
          rootDiv.remove();
        }}
      />,
      rootDiv
    );
  };

  renderModal(props);

  return {
    update(props) {
      renderModal(props);
    },
    close() {
      modalRef.current.hide();
    },
  };
};

export const confirm = ({ okText, onOk, cancelText, onCancel, ...props }) => {
  const modal = standaloneModal({
    ...props,
    allowClose: false,
    footer: (
      <Space align="end">
        <Button
          onClick={() => {
            onCancel?.();
            modal.close();
          }}
          autoFocus
        >
          {cancelText ?? "Cancel"}
        </Button>

        <Button
          onClick={() => {
            onOk?.();
            modal.close();
          }}
          look="primary"
        >
          {okText ?? "OK"}
        </Button>
      </Space>
    ),
  });

  return modal;
};

export const info = ({ okText, onOkPress, ...props }) => {
  const modal = standaloneModal({
    ...props,
    footer: (
      <Button
        onClick={() => {
          onOkPress?.();
          modal.close();
        }}
        look="primary"
        size="compact"
      >
        {okText ?? "OK"}
      </Button>
    ),
  });

  return modal;
};

Object.assign(Modal, {
  info,
  confirm,
  modal: standaloneModal,
});

export { Modal };
