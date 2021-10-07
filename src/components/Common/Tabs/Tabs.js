import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { FaEllipsisV } from "react-icons/fa";
import { BemWithSpecifiContext } from "../../../utils/bem";
import { Button } from "../Button/Button";
import { Dropdown } from "../Dropdown/DropdownComponent";
import { Icon } from "../Icon/Icon";
import Input from "../Input/Input";
import "./Tabs.styl";
import { TabsMenu } from "./TabsMenu";

const { Block, Elem } = BemWithSpecifiContext();

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
      lastTab: children.length === 1,
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
  onSave,
  editable = true,
  deletable = true,
  managable = true,
  virtual = false,
}) => {
  const { switchTab, selectedTab, lastTab } = useContext(TabsContext);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [renameMode, setRenameMode] = useState(false);
  const [hover, setHover] = useState(false);

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
      mod={{ active, hover, virtual }}
      onMouseEnter={()=>setHover(true)}
      onMouseLeave={()=>setHover(false)}
    > 
      <Elem
        name="item-left"
        onClick={() => switchTab?.(tab)}
        mod={{
          'edit': renameMode,
        }}
        title={currentTitle}
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
              setCurrentTitle(ev.target.value);
            }}
          />
        ) : (
          <span style={{  
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {currentTitle}
          </span>
        )}
      </Elem>
      <Elem
        name='item-right'
      >
        {(managable) && (
          <Dropdown.Trigger
            align="bottom-left"
            content={(
              <TabsMenu
                editable={editable}
                closable={!lastTab && deletable}
                virtual={virtual}
                onClick={(action) => {
                  switch(action) {
                    case "edit": return setRenameMode(true);
                    case "duplicate": return onDuplicate?.();
                    case "close": return onClose?.();
                    case "save": return onSave?.();
                  }
                }}
              />
            )}
          >
            <Elem
              name="item-right-button"
            >
              <Button
                type="link"
                size="small"
                style={{ padding: '6px', margin: 'auto', color: '#999' }}
                icon={<Icon icon={FaEllipsisV} />} />
            </Elem>
          </Dropdown.Trigger>
        )}
      </Elem>
    </Elem>
  );
};
