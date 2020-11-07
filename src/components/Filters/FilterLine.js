import { DeleteOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { observer } from "mobx-react";
import React from "react";
import { FilterDropdown } from "./FilterDropdown";
import { FilterOperation } from "./FilterOperation";

const Conjunction = observer(({ index, view }) => {
  return (
    <FilterDropdown
      items={[
        { value: "and", label: "And" },
        { value: "or", label: "Or" },
      ]}
      disabled={index > 1}
      value={view.conjunction}
      style={{ textAlign: "right" }}
      onChange={(value) => view.setConjunction(value)}
    />
  );
});

export const FilterLine = observer(
  ({ filter, availableFilters, index, view, sidebar }) => {
    return (
      <div className="filter-line">
        <div className="filter-line__settings">
          <div className="filter-line__group">
            <div className="filter-line__column filter-line__conjunction">
              {index === 0 ? (
                <span style={{ fontSize: 12, paddingRight: 5 }}>Where</span>
              ) : (
                <Conjunction index={index} view={view} />
              )}
            </div>
            <div className="filter-line__column filter-line__field">
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
          </div>
          <div className="filter-line__group">
            <FilterOperation
              filter={filter}
              value={filter.value}
              operator={filter.operator}
              field={filter.field}
            />
          </div>
        </div>
        <div className="filter-line__remove">
          <Button type="link" onClick={(e) => filter.delete()}>
            <DeleteOutlined />
          </Button>
        </div>
      </div>
    );
  }
);
