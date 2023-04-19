import { observer } from "mobx-react";
import React from "react";
import { Block, Elem } from "../../utils/bem";
import "./CandidateTaskView.styl";
import { getRoot } from "mobx-state-tree";
import { useEffect } from "react";
import { useState } from "react";

const DataItemVisual = ({ columns, dataKey, data }) => {
  const columnDefinition = columns.find(colData => colData.alias === dataKey);

  if (columnDefinition?.currentType === "Image") {
    return (
      <Elem name="data-display" mod={{ image: true }}>
        <img src={data} />
      </Elem>
    );
  }
  return (
    <Elem name="data-display" mod={{ text: true }} >
      {data}
    </Elem>
  );
};

const AttributeRow = (({ fieldName, value }) => {
  return (
    <Block name='attributeRow'>
      <Elem name='name'>{fieldName}</Elem>
      <Elem name='value'>{value}</Elem>
    </Block>
  );
});

export const CandidateTaskView = observer(({ item, columns }) => {
  const { candidate_task_id, id, data } = item;
  const [fname, setFName] = useState();
  

  useEffect(async () => {
    await getRoot(item).apiCall("candidateTaskMeta", {
      candidate_task_id,
    });
    const { metadata } = {
      "metadata": {
        "kind": "storage#object",
        "id": "heartex-test-images/hakan-dataset-test/784.png/1680042266459414",
        "selfLink": "https://www.googleapis.com/storage/v1/b/heartex-test-images/o/hakan-dataset-test%2F784.png",
        "mediaLink": "https://storage.googleapis.com/download/storage/v1/b/heartex-test-images/o/hakan-dataset-test%2F784.png?generation=1680042266459414&alt=media",
        "name": "hakan-dataset-test/784.png",
        "bucket": "heartex-test-images",
        "generation": "1680042266459414",
        "metageneration": "1",
        "contentType": "image/png",
        "storageClass": "STANDARD",
        "size": "9479",
        "md5Hash": "uCKcFuffGZXvfM7vnNS+iw==",
        "contentLanguage": "en",
        "crc32c": "CG1JEQ==",
        "etag": "CJb6/5PV//0CEAE=",
        "timeCreated": "2023-03-28T22:24:26.532Z",
        "updated": "2023-03-28T22:24:26.532Z",
        "timeStorageClassUpdated": "2023-03-28T22:24:26.532Z",
      },
      "candidate_task_id": "gs://heartex-test-images/hakan-dataset-test/784.png",
    };

    if (metadata) {
      setFName(metadata.name.split('/').pop());
    }
  });
  

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
          <Elem name="fname">{fname}</Elem>
        </Elem>
        <Elem name="detailContainer">
          <Elem name="detailSubContainer">
            <Elem name="subtitle">General</Elem>
            <Elem name="detailContent">
              <AttributeRow fieldName="ID:" value={id}/>
              <AttributeRow fieldName="File Type:" value={id}/>
              <AttributeRow fieldName="Mime Type:" value={id}/>
              <AttributeRow fieldName="Created:" value={id}/>
              <AttributeRow fieldName="Modified:" value={id}/>
              <AttributeRow fieldName="Size:" value={id}/>
              <AttributeRow fieldName="Dimensions:" value={id}/>
              <AttributeRow fieldName="Dataset:" value={id}/>
            </Elem>
          </Elem>
          <Elem name="detailSubContainer">
            <Elem name="subtitle">Origin Storage</Elem>
            <Elem name="detailContent">
              <AttributeRow fieldName="Name:" value={fname}/>
              <AttributeRow fieldName="Bucket:" value={id}/>
              <AttributeRow fieldName="External ID:" value={id}/>
            </Elem>
          </Elem>
          <Elem name="detailSubContainer">
            <Elem name="subtitle">Projects</Elem>
            <Elem name="detailContent">This file hasn’t been imported to any projects.</Elem>
          </Elem>
        </Elem>
      </Elem>
    </Block>
  );
});