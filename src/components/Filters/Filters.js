import { inject } from "mobx-react";
import React from "react";
import { BsLayoutSidebarInsetReverse } from "react-icons/bs";
import { FaPlus } from "react-icons/fa";
import { Block, cn, Elem } from "../../utils/bem";
import { Button } from "../Common/Button/Button";
import { Dropdown } from "../Common/Dropdown/Dropdown";
import { Tooltip } from "../Common/Tooltip/Tooltip";
import { FilterLine } from "./FilterLine/FilterLine";
import "./Filters.styl";

const injector = inject(({ store }) => ({
  store,
  views: store.viewsStore,
  currentView: store.currentView,
  filters: store.currentView?.currentFilters ?? [],
}));

export const Filters = injector(({ views, currentView, filters }) => {
  const { sidebarEnabled } = views;

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
    <Block name="filters" mod={{ sidebar: sidebarEnabled }}>
      <Elem name="list">
        {filters.length ? (
          filters.map((filter, i) => (
            <FilterLine
              index={i}
              filter={filter}
              view={currentView}
              sidebar={sidebarEnabled}
              value={filter.currentValue}
              key={`${filter.filter.id}-${i}`}
              availableFilters={Object.values(fields)}
              dropdownClassName={cn("filters").elem("selector")}
            />
          ))
        ) : (
          <Elem name="empty">No filters applied</Elem>
        )}
      </Elem>
      <Elem name="actions">
        <Button
          type="primary"
          size="small"
          onClick={() => currentView.createFilter()}
          icon={<FaPlus />}
        >
          Add {filters.length ? "Another Filter" : "Filter"}
        </Button>
        <Dropdown.Trigger content={<div>Hello world</div>}>
          <Button size="small">Hello world</Button>
        </Dropdown.Trigger>

        {!sidebarEnabled ? (
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
      </Elem>
    </Block>
  );
});
