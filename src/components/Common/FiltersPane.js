import { Button, Dropdown } from "antd";
import { inject, observer } from "mobx-react";
import React from "react";
import { VscListFilter } from "react-icons/vsc";
import { Filters } from "../Filters/Filters";

export const FiltersButton = observer(({ onClick, active, size }) => {
  return (
    <Button onClick={onClick} type={active ? "primary" : "default"} size={size}>
      <VscListFilter style={{ marginBottom: -2, marginRight: 7 }} />
      Filters
    </Button>
  );
});

const injector = inject(({ store }) => {
  const { viewsStore, currentView } = store;

  return {
    viewsStore,
    view: currentView ?? null,
    sidebarEnabled: viewsStore?.sidebarEnabled ?? false,
    filtersApplied: currentView?.filtersApplied ?? false,
  };
});

export const FiltersPane = injector(
  ({ viewsStore, sidebarEnabled, size, filtersApplied }) => {
    const dropdownProps = {};

    if (sidebarEnabled) {
      Object.assign(dropdownProps, {
        visible: false,
        disabled: true,
      });
    }

    return (
      <Dropdown trigger="click" overlay={() => <Filters />} {...dropdownProps}>
        <FiltersButton
          size={size}
          active={filtersApplied}
          onClick={sidebarEnabled && (() => viewsStore.toggleSidebar())}
        />
      </Dropdown>
    );
  }
);
