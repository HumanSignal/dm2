import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { FaEllipsisV } from "react-icons/fa";
import { BemWithSpecifiContext } from "../../../utils/bem";
import { Button } from "../Button/Button";
import { Dropdown } from "../Dropdown/DropdownComponent";
import { Icon } from "../Icon/Icon";
import Input from "../Input/Input";
import "./Tabs.styl";
import { TabsMenu } from "./TabsMenu";

const {Block, Elem} = BemWithSpecifiContext();

const TabsContext = createContext();

export const Tabs = ({
  children,
  activeTab,
  onChange,
  onAdd,
  tabBarExtraContent,
  addIcon,
}) => {
  const [selectedTab, setSelectedTab] = useState(activeTab);

  const switchTab = useCallback((tab) => {
    setSelectedTab(tab);
    onChange?.(tab);
  }, []);

  useEffect(() => {
    if (selectedTab !== activeTab) setSelectedTab(activeTab);
  }, [selectedTab, activeTab]);

  return (
    <TabsContext.Provider value={{
      switchTab,
      selectedTab,
      lastTab: children.length === 1
    }}>
      <Block name="tabs">
        <Elem name="list">
          {children}

          <Elem
            tag={Button}
            name="add"
            type="text"
            onClick={onAdd}
            icon={addIcon}
          />
        </Elem>
        <Elem name="extra">
          {tabBarExtraContent}
        </Elem>
      </Block>
    </TabsContext.Provider>
  );
};

export const TabsItem = ({
  title,
  tab,
  onFinishEditing,
  onCancelEditing,
  onClose,
  onDuplicate,
  editable = true,
  deletable = true,
  managable = true,
}) => {
  const {switchTab, selectedTab, lastTab} = useContext(TabsContext);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [renameMode, setRenameMode] = useState(false);

  const active = tab === selectedTab;

  const saveTabTitle = useCallback((ev) => {
    const { type, key } = ev;

    if (type === "blur" || ["Enter", "Escape"].includes(key)) {
      ev.preventDefault();
      setRenameMode(false);

      if (key === "Escape") {
        setCurrentTitle(title);
        onCancelEditing?.();
      }

      onFinishEditing(currentTitle);
    }
  }, [currentTitle]);

  return (
    <Elem
      name="item"
      mod={{active}}
      onClick={() => switchTab?.(tab)}
    >
      {renameMode ? (
        <Input
          size="small"
          autoFocus={true}
          style={{ width: 100 }}
          value={currentTitle}
          onKeyDownCapture={saveTabTitle}
          onBlur={saveTabTitle}
          onChange={(ev) => {
            console.log(ev.target.value);
            setCurrentTitle(ev.target.value);
          }}
        />
      ) : (
        currentTitle
      )}

      {(active && managable) && (
        <Dropdown.Trigger
          align="bottom-left"
          content={(
            <TabsMenu
              editable={editable}
              closable={!lastTab && deletable}
              onClick={(action) => {
                switch(action) {
                  case "edit": return setRenameMode(true);
                  case "duplicate": return onDuplicate?.();
                  case "close": return onClose?.();
                }
              }}
            />
          )}
        >
          <Button
            type="link"
            size="small"
            style={{ padding: 5, marginLeft: 10 }}
            icon={<Icon icon={FaEllipsisV} />}
          />
        </Dropdown.Trigger>
      )}
    </Elem>
  );
};
