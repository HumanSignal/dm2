import { observer } from "mobx-react";
import React from "react";
import { FaTrash } from "react-icons/fa";
import { Block, Elem } from "../../../utils/bem";
import { Button } from "../../Common/Button/Button";
import { Icon } from "../../Common/Icon/Icon";
import { Tag } from "../../Common/Tag/Tag";
import { FilterDropdown } from "../FilterDropdown";
import "./FilterLine.styl";
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
    const value = React.useMemo(() => {
      return filter.currentValue;
    }, [filter.currentValue]);

    return (
      <Block name="filter-line">
        <Elem name="settings">
          <GroupWrapper wrap={sidebar}>
            <Elem name="column" mix="conjunction">
              {index === 0 ? (
                <span style={{ fontSize: 12, paddingRight: 5 }}>Where</span>
              ) : (
                <Conjunction index={index} view={view} />
              )}
            </Elem>
            <Elem name="column" mix="field">
              <FilterDropdown
                placeholder="Column"
                defaultValue={filter.filter.id}
                items={availableFilters}
                width={80}
                dropdownWidth={120}
                dropdownClassName={dropdownClassName}
                onChange={(value) => filter.setFilter(value)}
                optionRender={({ original: filter }) => (
                  <Elem name="selector">
                    {filter.field.title}
                    {filter.field.parent && (
                      <Tag className="filters-data-tag" color="#1d91e4">
                        {filter.field.parent.title}
                      </Tag>
                    )}
                  </Elem>
                )}
              />
            </Elem>
          </GroupWrapper>
          <GroupWrapper wrap={sidebar}>
            <FilterOperation
              filter={filter}
              value={value}
              operator={filter.operator}
              field={filter.field}
            />
          </GroupWrapper>
        </Elem>
        <Elem name="remove">
          <Button
            type="link"
            onClick={(e) => {
              e.stopPropagation();
              filter.delete();
            }}
            icon={<Icon name={FaTrash} size={12} />}
          />
        </Elem>
      </Block>
    );
  }
);
