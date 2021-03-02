import { format, isValid } from "date-fns";
import React, { useState } from "react";
import { default as DP } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaExchangeAlt } from "react-icons/fa";
import { BemWithSpecifiContext } from "../../../utils/bem";
import { Dropdown } from "../Dropdown/Dropdown";
import { Icon } from "../Icon/Icon";
import Input from "../Input/Input";
import "./DatePicker.global.styl";
import "./DatePicker.styl";

const { Block, Elem } = BemWithSpecifiContext();

export const DatePicker = ({
  size,
  value,
  selectRange = false,
  showTime = false,
  dateFormat = "MM.dd.yyyy",
  timeFormat = "HH:mm",
  onChange,
  ...props
}) => {
  const finalFormat = showTime ? `${dateFormat} ${timeFormat}` : dateFormat;

  /**@type {import("react").RefObject<DP>} */
  const datepickerRef = React.useRef();

  const dropdownRef = React.useRef();

  const formatDate = (date) => {
    const parsedDate = new Date(date);
    if (isValid(parsedDate)) {
      return format(parsedDate, finalFormat);
    }

    return "";
  };

  const [initialStartDate, initialEndDate] = selectRange
    ? value
    : [].concat(value);

  const [realStartDate, setRealStartDate] = React.useState(
    initialStartDate ?? null
  );
  const [realEndDate, setRealEndDate] = React.useState(initialEndDate ?? null);

  const [startDate, setStartDate] = useState(formatDate(realStartDate));
  const [endDate, setEndDate] = useState(formatDate(realEndDate));

  const updateDate = (date, dateSetter, realDateSetter) => {
    const realDate = new Date(date);
    dateSetter?.(date);

    if (isValid(realDate)) realDateSetter?.(realDate);
  };

  const dateRange = React.useMemo(
    () =>
      selectRange
        ? {
            startDate: realStartDate,
            endDate: realEndDate,
          }
        : {},
    [selectRange, realStartDate, realEndDate]
  );

  React.useEffect(() => {
    if (isValid(realStartDate)) setStartDate(formatDate(realStartDate));
  }, [realStartDate]);

  React.useEffect(() => {
    if (isValid(realEndDate)) setEndDate(formatDate(realEndDate));
  }, [realEndDate]);

  React.useEffect(() => {
    if (selectRange) {
      if (realStartDate && realEndDate) dropdownRef.current?.close();
      onChange?.([realStartDate, realEndDate]);
    } else if (startDate) {
      dropdownRef.current?.close();
      onChange?.(realStartDate);
    }
  }, [realStartDate, realEndDate]);

  return (
    <Block name="datepicker">
      <Dropdown.Trigger
        ref={dropdownRef}
        toggle={false}
        content={
          <DP
            {...dateRange}
            ref={datepickerRef}
            selected={realStartDate}
            onSelect={(date) => {
              if (realEndDate === null && selectRange) {
                setRealEndDate(date);
              } else {
                setRealStartDate(date);
                if (selectRange) setRealEndDate(null);
              }
            }}
            monthsShown={2}
            selectsRange={selectRange}
            showTimeSelect={showTime}
            inline
          />
        }
      >
        <Elem name="output">
          <Input
            size={size}
            value={startDate || ""}
            onChange={(e) =>
              updateDate(e.target.value, setStartDate, setRealStartDate)
            }
          />
          {selectRange && (
            <>
              <Elem name="separator">
                <Icon icon={FaExchangeAlt} />
              </Elem>
              <Input
                size={size}
                value={endDate || ""}
                onChange={(e) =>
                  updateDate(e.target.value, setEndDate, setRealEndDate)
                }
              />
            </>
          )}
        </Elem>
      </Dropdown.Trigger>
    </Block>
  );
};