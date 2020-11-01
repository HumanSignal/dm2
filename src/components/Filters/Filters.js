import { DeleteFilled, PlusOutlined, PushpinOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { inject, observer } from "mobx-react";
import React from "react";
import { FilterDropdown } from "./FilterDropdown";
import { FilterInput } from "./FilterInput";
import { FiltersStyles } from "./Filters.styles";

export const FilterLine = ({ field, index, onDelete }) => {
  return (
    <div className="filter-line">
      <div className="filter-line__remove">
        <a
          href="#/"
          onClick={(e) => {
            e.preventDefault();
            onDelete(index);
          }}
        >
          <DeleteFilled />
        </a>
      </div>
      <div className="filter-line__settings">
        <div className="filter-line__column">
          <FilterDropdown
            placeholder="Column"
            defaultValue={field.field}
            items={[
              { value: "id", label: "ID" },
              { value: "task_status", label: "Status" },
              { value: "created_on", label: "Created on" },
            ]}
            width={80}
            dropdownWidth={120}
          />
        </div>
        <FilterInput field={field} />
      </div>
    </div>
  );
};

export const Filters = inject("store")(
  observer(({ store }) => {
    const views = store.viewsStore;
    const currentView = views.selected;
    console.log(currentView);
    const selectedFilters = currentView.filters.map((f) => {
      const { filter } = f;
      return {
        ...filter,
      };
    });

    console.log({ selectedFilters });

    const [filters, setFilters] = React.useState([
      { type: "Number", width: 80, field: "id" },
      {
        type: "List",
        width: 80,
        field: "task_status",
        variants: [
          { value: "status1", label: "Status 1" },
          { value: "status2", label: "Status 2" },
          { value: "status3", label: "Status 3" },
        ],
      },
    ]);
    return (
      <FiltersStyles className="filters">
        <div className="filters__settings">
          <Button type="link" onClick={() => console.log("pin filters")}>
            <PushpinOutlined />
          </Button>
        </div>
        <div className="filters__list">
          {filters.map((f, i) => (
            <FilterLine
              key={`${f.field}-${i}`}
              field={f}
              index={i}
              onDelete={(index) => {
                setFilters(
                  filters.filter((el, i) => {
                    return index !== i;
                  })
                );
              }}
            />
          ))}
        </div>
        <div className="filters__actions">
          <Button
            type="link"
            onClick={() => {
              setFilters([
                ...filters,
                { type: "Number", width: 80, field: "id" },
              ]);
            }}
          >
            <PlusOutlined />
            Add another rule
          </Button>
        </div>
      </FiltersStyles>
    );
  })
);
