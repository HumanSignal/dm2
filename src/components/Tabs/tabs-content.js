import { observer } from "mobx-react";
import React from "react";
import { Table } from "../Table/Table";
import { TablePanel } from "./tabs-panel";

export const TabContent = observer(({ item, data }) => {
  const columns = item.fieldsAsColumns;

  return (
    <>
      <TablePanel item={item} />
      <Table item={item} columns={columns} data={Array.from(data)} />
    </>
  );
});
