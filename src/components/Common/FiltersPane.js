import { inject, observer } from "mobx-react";
import React, { useEffect, useRef } from "react";
import { FaFilter } from "react-icons/fa";
import { Filters } from "../Filters/Filters";
import { Button } from "./Button/Button";
import { Dropdown } from "./Dropdown/Dropdown";

const buttonInjector = inject(({store}) => {
  const { viewsStore, currentView } = store;

  return {
    viewsStore,
    sidebarEnabled: viewsStore?.sidebarEnabled ?? false,
    active: currentView?.filtersApplied ?? false,
  };
});

export const FiltersButton = buttonInjector(observer(
  React.forwardRef(({ active, size, sidebarEnabled, viewsStore, ...rest }, ref) => {
    return (
      <Button
        ref={ref}
        look={active && "primary"}
        size={size}
        icon={<FaFilter />}
        onClick={() => sidebarEnabled && viewsStore.toggleSidebar()}
        {...rest}
      >
        Filters
      </Button>
    );
  })
));

const injector = inject(({ store }) => {
  return {
    sidebarEnabled: store?.viewsStore?.sidebarEnabled ?? false,
  };
});

export const FiltersPane = injector(
  observer(({ sidebarEnabled, size, ...rest }) => {
    const dropdown = useRef();

    useEffect(() => {
      if (sidebarEnabled === true) {
        dropdown?.current?.close();
      }
    }, [sidebarEnabled]);

    return (
      <Dropdown.Trigger
        ref={dropdown}
        disabled={sidebarEnabled}
        content={<Filters/>}
      >
        <FiltersButton {...rest} size={size}/>
      </Dropdown.Trigger>
    );
  })
);
