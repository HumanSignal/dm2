import { observer } from "mobx-react";
import React from "react";
import { Block, Elem } from "../../utils/bem";
import "./CandidateTaskView.styl";

export const CandidateTaskView = observer(({ item, columns }) => {
  const { data } = item;

  return (
    <Block name="candidate-task-view">
      <Elem name="data-display-container">
        {Object.keys(data).map( (dataKey) => {
          const columnDefinition = columns.find(colData => colData.alias === dataKey);
          const dataValue = data[dataKey];
          let elementDisplay;
          
          if (columnDefinition) {
            if (columnDefinition.currentType === "Image") {
              elementDisplay = (
                <Elem name='data-display' mod={{ image: true }}>
                  <img src={dataValue} />
                </Elem>
              );
            } else {
              elementDisplay = (
                <Elem name='data-display' mod={{ text: true }} >
                  {dataValue}
                </Elem>
              );
            }
          }
          return elementDisplay;
        })}
      </Elem>
      <Elem name="details">
        <Elem name="detailContainer">
          <Elem name="title">File Attributes</Elem>
        </Elem>
        <Elem name="detailContainer">
          coming soon
        </Elem>
      </Elem>
    </Block>
  );
});