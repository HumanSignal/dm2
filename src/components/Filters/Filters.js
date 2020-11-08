import { ExpandAltOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import { inject, observer } from "mobx-react";
import React from "react";
import { FilterLine } from "./FilterLine";
import { FiltersStyles } from "./Filters.styles";

export const Filters = inject("store")(
  observer(({ store, sidebar }) => {
    const views = store.viewsStore;
    const currentView = views.selected;

    const { filters, availableFilters } = currentView;

    return (
      <FiltersStyles
        className={["filters", sidebar ? "filters__sidebar" : null]}
      >
        <div className="filters__list">
          {filters.length ? (
            filters.map((filter, i) => (
              <FilterLine
                index={i}
                filter={filter}
                view={currentView}
                sidebar={sidebar}
                key={`${filter.filter.id}-${i}`}
                availableFilters={availableFilters}
              />
            ))
          ) : (
            <div className="filters__empty">No filters applied</div>
          )}
        </div>
        <div className="filters__actions">
          <Button
            type="primary"
            size="small"
            ghost
            onClick={() => currentView.createFilter()}
          >
            <PlusOutlined />
            Add {filters.length ? "another filter" : "filter"}
          </Button>

          {!sidebar ? (
            <Tooltip title="Pin to sidebar">
              <Button
                type="link"
                size="small"
                about="Pin to sidebar"
                onClick={() => views.expandFilters()}
              >
                <ExpandAltOutlined />
              </Button>
            </Tooltip>
          ) : null}
        </div>
      </FiltersStyles>
    );
  })
);
