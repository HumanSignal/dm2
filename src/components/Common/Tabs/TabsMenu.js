import { Menu } from "../Menu/Menu";

export const TabsMenu = ({
  onClick,
  editable = true,
  closable = true,
}) => {
  return (
    <Menu size="medium" onClick={(e) => e.domEvent.stopPropagation()}>
      {editable && (
        <Menu.Item onClick={() => onClick("edit")}>
          Rename
        </Menu.Item>
      )}

      <Menu.Item onClick={() => onClick("duplicate")}>
        Duplicate
      </Menu.Item>

      {closable ? (
        <>
          <Menu.Divider />
          <Menu.Item onClick={() => onClick("close")}>
            Close
          </Menu.Item>
        </>
      ) : null}
    </Menu>
  );
};
