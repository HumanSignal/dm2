import { inject, observer } from "mobx-react";
import React, { useCallback, useEffect, useRef } from "react";
import { FaFilter } from "react-icons/fa";
import { Filters } from "../Filters/Filters";
import { Button } from "./Button/Button";
import { Dropdown } from "./Dropdown/Dropdown";

export const FiltersButton = observer(
  React.forwardRef(({ active, size, ...rest }, ref) => {
    return (
      <Button
        ref={ref}
        look={active && "primary"}
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
    const dropdown = useRef();

    if (sidebarEnabled) {
      Object.assign(dropdownProps, {
        visible: false,
        disabled: true,
      });
    }

    useEffect(() => {
      if (sidebarEnabled) {
        dropdown?.current?.close();
      }
    }, [sidebarEnabled]);

    const toggleCallback = useCallback(() => {
      if (sidebarEnabled) viewsStore.toggleSidebar();
    }, [sidebarEnabled]);

    return (
      <Dropdown.Trigger
        ref={dropdown}
        disabled={sidebarEnabled}
        content={<Filters />}
      >
        <FiltersButton
          size={size}
          active={filtersApplied}
          onClick={toggleCallback}
          {...rest}
        />
      </Dropdown.Trigger>
    );
  }
);
