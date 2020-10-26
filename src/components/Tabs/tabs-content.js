import { observer } from "mobx-react";
import React from "react";
import { Table } from "../Table/Table";
import { TablePanel } from "./tabs-panel";

export const TabContent = observer(({ item, data }) => {
  const columns = item.fieldsAsColumns;

  const [skipPageReset, setSkipPageReset] = React.useState(false);

  return (
    <div>
      <TablePanel item={item} />
      <Table
        columns={columns}
        data={data}
        item={item}
        skipPageReset={skipPageReset}
      />
    </div>
  );
});
