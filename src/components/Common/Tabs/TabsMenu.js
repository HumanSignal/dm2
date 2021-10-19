import { Menu } from "../Menu/Menu";

export const TabsMenu = ({
  onClick,
  editable = true,
  closable = true,
  virtual = false,
}) => {
  return (
    <Menu size="medium" onClick={(e) => e.domEvent.stopPropagation()}>
      {editable && !virtual && (
        <Menu.Item onClick={() => onClick("edit")}>
          Rename
        </Menu.Item>
      )}

      {!virtual && (
        <Menu.Item onClick={() => onClick("duplicate")}>
        Duplicate
        </Menu.Item>
      )}

      {virtual && (
        <Menu.Item onClick={() => onClick("save")}>
            Save
        </Menu.Item>
      )}

      {closable ? (
        <>
          {!virtual && <Menu.Divider />}
          <Menu.Item onClick={() => onClick("close")}>
            Close
          </Menu.Item>
        </>
      ) : null}
    </Menu>
  );
};
