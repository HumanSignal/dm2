import { Button, Dropdown } from "antd";
import { observer } from "mobx-react";
import React from "react";
import { VscListFilter } from "react-icons/vsc";
import { Filters } from "../Filters/Filters";

const FiltersButton = observer(({ onClick, active }) => {
  return (
    <Button onClick={onClick} type={active ? "primary" : "default"}>
      <VscListFilter style={{ marginBottom: -2, marginRight: 7 }} />
      Filters
    </Button>
  );
});

export const FiltersPane = ({ sidebar, viewStore }) => {
  const view = viewStore?.selected;

  if (!view) return null;

  return sidebar ? (
    <FiltersButton
      onClick={() => viewStore.toggleSidebar()}
      active={view.filtersApplied}
    />
  ) : (
    <Dropdown overlay={<Filters />} trigger="click">
      <FiltersButton active={view.filtersApplied} />
    </Dropdown>
  );
};
