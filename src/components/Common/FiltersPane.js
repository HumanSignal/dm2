import { inject, observer } from "mobx-react";
import React from "react";
import { FaFilter } from "react-icons/fa";
import { Filters } from "../Filters/Filters";
import { Button } from "./Button/Button";
import { Dropdown } from "./Dropdown/Dropdown";

export const FiltersButton = observer(
  React.forwardRef(({ active, size, ...rest }, ref) => {
    return (
      <Button
        ref={ref}
        primary={active}
        size={size}
        icon={<FaFilter />}
        {...rest}
      >
        Filters
      </Button>
    );
  })
);

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
  ({ viewsStore, sidebarEnabled, size, filtersApplied, ...rest }) => {
    const dropdownProps = {};

    if (sidebarEnabled) {
      Object.assign(dropdownProps, {
        visible: false,
        disabled: true,
      });
    }

    return (
      <Dropdown.Trigger content={<Filters />}>
        <FiltersButton
          size={size}
          active={filtersApplied}
          onClick={sidebarEnabled ? () => viewsStore.toggleSidebar() : null}
          {...rest}
        />
      </Dropdown.Trigger>
    );
  }
);
