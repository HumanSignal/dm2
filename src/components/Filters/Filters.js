import { PlusOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import { inject, observer } from "mobx-react";
import React from "react";
import { BsLayoutSidebarInsetReverse } from "react-icons/bs";
import { FilterLine } from "./FilterLine";
import { FiltersStyles } from "./Filters.styles";

export const Filters = inject("store")(
  observer(({ store, sidebar }) => {
    const views = store.viewsStore;
    const currentView = views.selected;

    const filters = React.useMemo(() => {
      const { filters } = currentView;
      return filters.length ? filters : [];
    }, [currentView]);

    const fields = React.useMemo(
      () =>
        currentView.availableFilters.reduce((res, filter) => {
          const target = filter.field.target;
          const groupTitle = target
            .split("_")
            .map((s) =>
              s
                .split("")
                .map((c, i) => (i === 0 ? c.toUpperCase() : c))
                .join("")
            )
            .join(" ");
          const group = res[target] ?? {
            id: target,
            title: groupTitle,
            options: [],
          };

          group.options.push({
            value: filter.id,
            title: filter.field.title,
            original: filter,
          });

          return { ...res, [target]: group };
        }, {}),
      [currentView.availableFilters]
    );

    return (
      <FiltersStyles
        className={["filters", sidebar ? "filters__sidebar" : null]}
      >
        {({ className }) => (
          <>
            <div className="filters__list">
              {filters.length ? (
                filters.map((filter, i) => (
                  <FilterLine
                    index={i}
                    filter={filter}
                    view={currentView}
                    sidebar={sidebar}
                    key={`${filter.filter.id}-${i}`}
                    availableFilters={Object.values(fields)}
                    dropdownClassName={className.split(" ")[1]}
                  />
                ))
              ) : (
                <div className="filters__empty">No filters applied</div>
              )}
            </div>
            <div className="filters__actions">
              <Button
                ghost
                type="primary"
                size="small"
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
                    style={{ display: "inline-flex", alignItems: "center" }}
                  >
                    <BsLayoutSidebarInsetReverse />
                  </Button>
                </Tooltip>
              ) : null}
            </div>
          </>
        )}
      </FiltersStyles>
    );
  })
);
