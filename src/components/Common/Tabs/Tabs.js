import React from "react";
import { cn } from "../../../utils/bem";
import { Button } from "../Button/Button";
import "./Tabs.styl";

export const Tabs = ({
  children,
  activeTab,
  onChange,
  onEdit,
  tabBarExtraContent,
  addIcon,
}) => {
  const rootClass = cn("tabs");

  const [selectedTab, setSelectedTab] = React.useState(activeTab);

  const switchTab = (child) => {
    setSelectedTab(child.props.tab);
    onChange?.(child.props.tab);
  };

  React.useEffect(() => {
    if (selectedTab !== activeTab) setSelectedTab(activeTab);
  }, [selectedTab, activeTab]);

  return (
    <div className={rootClass}>
      <div className={rootClass.elem("list")}>
        {children.map((child) => (
          <TabsItem
            key={child.props.tab}
            content={child}
            activeTab={selectedTab}
            onClick={switchTab}
          />
        ))}

        <Button
          type="text"
          className={rootClass.elem("add")}
          onClick={onEdit}
          icon={addIcon}
        />
      </div>
      <div className={rootClass.elem("extra")}>{tabBarExtraContent}</div>
    </div>
  );
};

const TabsItem = ({ content, activeTab, onClick }) => {
  const rootClass = cn("tabs");
  const tab = content.props.tab;
  const active = tab === activeTab;

  return (
    <div
      className={rootClass.elem("item").mod({ active })}
      onClick={() => onClick?.(content)}
    >
      {content}
    </div>
  );
};
