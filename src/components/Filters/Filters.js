import { DeleteFilled, PlusOutlined, PushpinOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { inject, observer } from "mobx-react";
import React from "react";
import { FilterDropdown } from "./FilterDropdown";
import { FilterInput } from "./FilterInput";
import { FiltersStyles } from "./Filters.styles";

export const FilterLine = observer(
  ({ filter, availableFilters, index, onDelete }) => {
    return (
      <div className="filter-line">
        <div className="filter-line__remove">
          <a
            href="#/"
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            <DeleteFilled />
          </a>
        </div>
        <div className="filter-line__settings">
          <div className="filter-line__column">
            <FilterDropdown
              placeholder="Column"
              defaultValue={filter.filter.id}
              items={availableFilters.map((f) => ({
                value: f.id,
                label: f.field.title,
              }))}
              width={80}
              dropdownWidth={120}
              onChange={(value) => filter.setFilter(value)}
            />
          </div>
          <FilterInput
            filter={filter}
            value={filter.value}
            operator={filter.operator}
            field={filter.field}
          />
        </div>
      </div>
    );
  }
);

export const Filters = inject("store")(
  observer(({ store }) => {
    const views = store.viewsStore;
    const currentView = views.selected;

    const { availableFilters } = views;
    const { filters } = currentView;

    return (
      <FiltersStyles className="filters">
        <div className="filters__settings">
          <Button type="link" onClick={() => console.log("pin filters")}>
            <PushpinOutlined />
          </Button>
        </div>
        <div className="filters__list">
          {filters.map((filter, i) => (
            <FilterLine
              filter={filter}
              key={`${filter.filter.id}-${i}`}
              availableFilters={availableFilters}
            />
          ))}
        </div>
        <div className="filters__actions">
          <Button type="link" onClick={() => currentView.createFilter()}>
            <PlusOutlined />
            Add another rule
          </Button>
        </div>
      </FiltersStyles>
    );
  })
);
