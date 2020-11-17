import { DeleteOutlined } from "@ant-design/icons";
import { Button, Tag } from "antd";
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

const GroupWrapper = ({ children, wrap = false }) => {
  return wrap ? <div className="filter-line__group">{children}</div> : children;
};

export const FilterLine = observer(
  ({ filter, availableFilters, index, view, sidebar, dropdownClassName }) => {
    return (
      <div className="filter-line">
        <div className="filter-line__settings">
          <GroupWrapper wrap={sidebar}>
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
                items={availableFilters}
                width={80}
                dropdownWidth={120}
                dropdownClassName={dropdownClassName}
                onChange={(value) => filter.setFilter(value)}
                optionRender={({ original: filter }) => (
                  <div className="filters__selector">
                    {filter.field.title}
                    {filter.field.parent && (
                      <Tag className="filters__selector__tag" color="#1d91e4">
                        {filter.field.parent.title}
                      </Tag>
                    )}
                  </div>
                )}
              />
            </div>
          </GroupWrapper>
          <GroupWrapper wrap={sidebar}>
            <FilterOperation
              filter={filter}
              value={filter.value}
              operator={filter.operator}
              field={filter.field}
            />
          </GroupWrapper>
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
