import { observer } from "mobx-react";
import React from "react";
import { Block, Elem } from "../../utils/bem";
import "./CandidateTaskView.styl";

const DataItemVisual = ({ columns, dataKey, data }) => {
  const columnDefinition = columns.find(colData => colData.alias === dataKey);

  if (columnDefinition?.currentType === "Image") {
    return (
      <Elem name='data-display' mod={{ image: true }}>
        <img src={data} />
      </Elem>
    );
  }
  return (
    <Elem name='data-display' mod={{ text: true }} >
      {data}
    </Elem>
  );
};

export const CandidateTaskView = observer(({ item, columns }) => {
  const { data } = item;

  return (
    <Block name="candidate-task-view">
      <Elem name="data-display-container">
        {Object.entries(data).map( ([dataKey, dataValue]) => (
          <DataItemVisual key={dataKey} columns={columns} dataKey={dataKey} data={dataValue} />
        ))}
      </Elem>
      <Elem name="details">
        <Elem name="detailContainer">
          <Elem name="title">File Attributes</Elem>
        </Elem>
        <Elem name="detailContainer">
          Coming soon
        </Elem>
      </Elem>
    </Block>
  );
});