import { Button, Dropdown } from "antd";
import { observer } from "mobx-react";
import React from "react";
import { VscListFilter } from "react-icons/vsc";
import { Filters } from "../Filters/Filters";

const FiltersButton = observer(({ onClick, active, size }) => {
  return (
    <Button onClick={onClick} type={active ? "primary" : "default"} size={size}>
      <VscListFilter style={{ marginBottom: -2, marginRight: 7 }} />
      Filters
    </Button>
  );
});

export const FiltersPane = ({ sidebar, viewStore, filters, size }) => {
  const view = viewStore?.selected;

  if (!view) return null;

  return sidebar ? (
    <FiltersButton
      onClick={() => viewStore.toggleSidebar()}
      active={view.filtersApplied}
    />
  ) : (
    <Dropdown overlay={<Filters filters={filters} />} trigger="click">
      <FiltersButton size={size} active={view.filtersApplied} />
    </Dropdown>
  );
};
