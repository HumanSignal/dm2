import { inject, observer } from "mobx-react";
import { FaAngleDown, FaTrash } from "react-icons/fa";
import { Button } from "../../Common/Button/Button";
import { Dropdown } from "../../Common/Dropdown/DropdownComponent";
import { Menu } from "../../Common/Menu/Menu";
import { Modal } from "../../Common/Modal/ModalPopup";

const injector = inject(({ store }) => ({
  store,
  hasSelected: store.currentView?.selected?.hasSelected ?? false,
}));

export const ActionsButton = injector(observer(({ store, size, hasSelected, ...rest }) => {
  const selectedCount = store.currentView.selectedCount;
  const actions = store.availableActions
    .filter((a) => !a.hidden)
    .sort((a, b) => a.order - b.order);

  const invokeAction = (action, destructive) => {
    if (action.dialog) {
      const { type: dialogType, text } = action.dialog;
      const dialog = Modal[dialogType] ?? Modal.confirm;

      dialog({
        title: destructive ? "Destructive action." : "Confirm action.",
        body: text,
        buttonLook: destructive ? "destructive" : "primary",
        onOk() {
          store.invokeAction(action.id);
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

  return (
    <Dropdown.Trigger content={<Menu size="compact">{actionButtons}</Menu>} disabled={!hasSelected}>
      <Button size={size} disabled={!hasSelected} {...rest} >
        {selectedCount > 0 && selectedCount} Tasks
        <FaAngleDown size="16" style={{ marginLeft: 4 }} color="#0077FF" />
      </Button>
    </Dropdown.Trigger>
  );
}));
