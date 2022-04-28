import { observer } from "mobx-react";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { FaCode } from "react-icons/fa";
import { useSDK } from "../../../providers/SDKProvider";
import { isDefined } from "../../../utils/utils";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import { modal } from "../Modal/Modal";
import { Tooltip } from "../Tooltip/Tooltip";
import "./Table.styl";
import { TableCheckboxCell } from "./TableCheckbox";
import { TableBlock, TableContext, TableElem } from "./TableContext";
import { TableHead } from "./TableHead/TableHead";
import { TableRow } from "./TableRow/TableRow";
import { prepareColumns } from "./utils";
import { Block, Elem } from "../../../utils/bem";
import { FieldsButton } from "../FieldsButton";
import { LsGear } from "../../../assets/icons";

const Decorator = (decoration) => {
  return {
    get(col) {
      return decoration.find((d) => {
        let found = false;

        if (isDefined(d.alias)) {
          found = d.alias === col.alias;
        } else if (d.resolver instanceof Function) {
          found = d.resolver(col);
        }

        return found;
      });
    },
  };
};

const RowRenderer = observer(({
  row,
  index,
  stopInteractions,
  rowHeight,
  fitContent,
  onRowClick,
  decoration,
}) => {
  const isEven = index % 2 === 0;
  const mods = {
    even: isEven,
    selected: row.isSelected,
    highlighted: row.isHighlighted,
    loading: row.isLoading,
    disabled: stopInteractions,
  };

  return (
    <TableElem
      key={`${row.id}-${index}`}
      name="row-wrapper"
      mod={mods}
      onClick={(e) => onRowClick?.(row, e)}
    >
      <TableRow
        key={row.id}
        data={row}
        even={index % 2 === 0}
        style={{
          height: rowHeight,
          width: fitContent ? "fit-content" : "auto",
        }}
        decoration={decoration}
      />
    </TableElem>
  );
});

const SelectionObserver = observer(({ id, selection, onSelect, className }) => {
  return (
    <TableCheckboxCell
      checked={id ? selection.isSelected(id) : selection.isAllSelected}
      indeterminate={!id && selection.isIndeterminate}
      onChange={onSelect}
      className={className}
    />
  );
});

export const Table = observer(
  ({
    view,
    data,
    cellViews,
    selectedItems,
    focusedItem,
    decoration,
    stopInteractions,
    onColumnResize,
    onColumnReset,
    headerExtra,
    ...props
  }) => {
    const tableHead = useRef();
    const columns = prepareColumns(props.columns, props.hiddenColumns);
    const Decoration = useMemo(() => Decorator(decoration), [decoration]);
    const { api } = useSDK();


    if (props.onSelectAll && props.onSelectRow) {
      columns.unshift({
        id: "select",
        headerClassName: "select-all",
        cellClassName: "select-row",
        style: {
          width: 40,
          maxWidth: 40,
          justifyContent: "center",
        },
        onClick: (e) => e.stopPropagation(),
        Header: () => {
          return (
            <SelectionObserver
              selection={selectedItems}
              onSelect={props.onSelectAll}
              className="select-all"
            />
          );
        },
        Cell: ({ data }) => {
          return (
            <SelectionObserver
              id={data.id}
              selection={selectedItems}
              onSelect={() => props.onSelectRow(data.id)}
            />
          );
        },
      });
    }

    columns.push({
      id: "show-source",
      cellClassName: "show-source",
      style: {
        width: 40,
        maxWidth: 40,
        justifyContent: "center",
      },
      onClick: (e) => e.stopPropagation(),
      Header() {
        return <div style={{ width: 40 }} />;
      },
      Cell({ data }) {
        let out = JSON.parse(data.source ?? "{}");

        out = {
          id: out?.id,
          data: out?.data,
          annotations: out?.annotations,
          predictions: out?.predictions,
        };

        const onTaskLoad = async () => {
          const response = await api.task({ taskID: out.id });

          return response ?? {};
        };

        return (
          <Tooltip title="Show task source">
            <Button
              type="link"
              style={{ width: 32, height: 32, padding: 0 }}
              onClick={() => {
                modal({
                  title: "Source for task " + out?.id,
                  style: { width: 800 },
                  body: <TaskSourceView content={out} onTaskLoad={onTaskLoad} />,
                });
              }}
              icon={<Icon icon={FaCode}/>}
            />
          </Tooltip>
        );
      },
    });

    const contextValue = {
      columns,
      data,
      cellViews,
    };

    const tableWrapper = useRef();

    useEffect(() => {    
      const highlightedIndex = data.indexOf(focusedItem) - 1;
      const highlightedElement = tableWrapper.current?.children[highlightedIndex];

      if (highlightedElement) highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [tableWrapper.current]);

    return (
      <>
        {view.root.isLabeling && (
          <Block name="column-selector">
            <Elem
              name="button"
              tag={FieldsButton}
              icon={<LsGear />}
              wrapper={FieldsButton.Checkbox}
              style={{ padding: 0 }}
            />
          </Block>
        )}
        <TableBlock
          ref={tableWrapper}
          name="table"
          mod={{ fit: props.fitToContent }}
        >
          <TableContext.Provider value={contextValue}>
            <TableHead
              ref={tableHead}
              order={props.order}
              columnHeaderExtra={props.columnHeaderExtra}
              sortingEnabled={props.sortingEnabled}
              onSetOrder={props.onSetOrder}
              stopInteractions={stopInteractions}
              onTypeChange={props.onTypeChange}
              decoration={Decoration}
              onResize={onColumnResize}
              onReset={onColumnReset}
              extra={headerExtra}
            />
            {data.map((row, index) => {
              return (
                <RowRenderer
                  key={`${row.id}-${index}`}l
                  row={row}
                  index={index}
                  onRowClick={props.onRowClick}
                  stopInteractions={stopInteractions}
                  rowHeight={props.rowHeight}
                  fitContent={props.fitToContent}
                  decoration={Decoration}
                />
              );
            })}
          </TableContext.Provider>
        </TableBlock>
      </>
    );
  },
);

const TaskSourceView = ({ content, onTaskLoad }) => {
  const [source, setSource] = useState(content);

  useEffect(() => {
    onTaskLoad().then((response) => {
      const formatted = {
        id: response.id,
        data: response.data,
        annotations: response.annotations ?? [],
        predictions: response.predictions ?? [],
      };

      setSource(formatted);
    });
  }, []);

  return (
    <pre>{source ? JSON.stringify(source, null, "  ") : null}</pre>
  );
};
