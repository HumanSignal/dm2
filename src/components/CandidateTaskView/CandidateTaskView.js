import { observer } from "mobx-react";
import React from "react";
import { Block, Elem } from "../../utils/bem";
import "./CandidateTaskView.styl";

export const CandidateTaskView = observer(({ item }) => {
  const { data } = item;

  return (
    <Block name="candidate-task-view">
      <Elem name="data-display">
        {data?.image && (
          <Elem name='image' tag="img" src={data?.image} />
        )}
        {data?.text && (
          <Elem name='text'>
            {data?.text}
          </Elem>
        )}
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