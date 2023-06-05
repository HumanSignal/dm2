import { inject, observer } from "mobx-react";
import { useRef } from "react";
import { FaAngleDown, FaChevronDown, FaChevronUp, FaTrash } from "react-icons/fa";
import { Block, Elem } from "../../../utils/bem";
import { FF_LOPS_E_3, isFF } from "../../../utils/feature-flags";
import { Button } from "../../Common/Button/Button";
import { Dropdown } from "../../Common/Dropdown/DropdownComponent";
import Form from "../../Common/Form/Form";
import { Menu } from "../../Common/Menu/Menu";
import { Modal } from "../../Common/Modal/ModalPopup";
import { useState } from "react";
import "./ActionsButton.styl";

const injector = inject(({ store }) => ({
  store,
  hasSelected: store.currentView?.selected?.hasSelected ?? false,
}));

const buildDialogContent = (text, form, formRef) => {
  return (
    <Block name="dialog-content">
      <Elem name="text">{text}</Elem>
      {form && (
        <Elem name="form" style={{ paddingTop: 16 }}>
          <Form.Builder
            ref={formRef}
            fields={form.toJSON()}
            autosubmit={false}
            withActions={false}
          />
        </Elem>
      )}
    </Block>
  );
};

export const ActionsButton = injector(observer(({ store, size, hasSelected, ...rest }) => {
  const formRef = useRef();
  const [isOpen, setIsOpen] = useState(false);
  const selectedCount = store.currentView.selectedCount;
  const actions = store.availableActions
    .filter((a) => !a.hidden)
    .sort((a, b) => a.order - b.order);

  const invokeAction = (action, destructive) => {
    if (action.dialog) {
      const { type: dialogType, text, form } = action.dialog;
      const dialog = Modal[dialogType] ?? Modal.confirm;

      dialog({
        title: destructive ? "Destructive action." : "Confirm action.",
        body: buildDialogContent(text, form, formRef),
        buttonLook: destructive ? "destructive" : "primary",
        onOk() {
          const body = formRef.current?.assembleFormData({ asJSON: true });

          store.invokeAction(action.id, { body });
        },
      });
    } else {
      store.invokeAction(action.id);
    }
  };

  const actionButtons = actions.map((action) => {
    const isDeleteAction = action.id.includes("delete");

    return (
      <Menu.Item
        size={size}
        key={action.id}
        danger={isDeleteAction}
        onClick={() => {
          invokeAction(action, isDeleteAction);
        }}
        icon={isDeleteAction && <FaTrash />}
      >
        {action.title}
      </Menu.Item>
    );
  });

  const isFFLOPSE3 = isFF(FF_LOPS_E_3);

  console.log("did this compile?");

  return (
    <Dropdown.Trigger 
      content={<Elem tag={Menu} name="actionmenu" mod={{ isNewUI: isFFLOPSE3 }} size="compact">{actionButtons}</Elem>} 
      disabled={!hasSelected}
      onToggle={(visible) => isFFLOPSE3 && setIsOpen(visible)}
    >
      <Button size={size} disabled={!hasSelected} {...rest} >
        {selectedCount > 0 ? selectedCount + " Tasks": "Actions"}
        {isFFLOPSE3 ? (
          isOpen ? (
            <FaChevronUp size="12" style={{ marginLeft: 4, marginRight: -7 }} />
          ) : (
            <FaChevronDown size="12" style={{ marginLeft: 4, marginRight: -7 }} />
          )
        ) : (
          <FaAngleDown size="16" style={{ marginLeft: 4 }} color="#0077FF" />
        )}
      </Button>
    </Dropdown.Trigger>
  );
}));
