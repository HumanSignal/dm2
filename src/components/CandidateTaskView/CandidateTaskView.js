import { observer } from "mobx-react";
import React, { forwardRef, useRef } from "react";
import { Block, Elem } from "../../utils/bem";
import "./CandidateTaskView.styl";
import { getRoot } from "mobx-state-tree";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { FF_LSDV_4711, isFF } from "../../utils/feature-flags";

const imgDefaultProps = {};

if (isFF(FF_LSDV_4711)) imgDefaultProps.crossOrigin = 'anonymous';

const DataItemVisual = forwardRef(({ columns, dataKey, data }, imageRef) => {
  const columnDefinition = columns.find(colData => colData.alias === dataKey);

  if (columnDefinition?.currentType === "Image") {
    return (
      <Elem name="data-display" mod={{ image: true }}>
        <img {...imgDefaultProps} ref={imageRef} src={data} />
      </Elem>
    );
  }
  return (
    <Elem name="data-display" mod={{ text: true }} >
      {data}
    </Elem>
  );
});

const AttributeRow = (({ fieldName, value }) => {
  return (
    <Block name='attributeRow'>
      <Elem name='name'>{fieldName}</Elem>
      <Elem name='value'>{value}</Elem>
    </Block>
  );
});
const dateDisplayFormat = "MMM dd, yyyy HH:mm a";

export const CandidateTaskView = observer(({ item, columns }) => {
  const { candidate_task_id, id, data } = item;
  const dataset = getRoot(item)?.SDK?.dataset;
  const [fName, setFName] = useState();
  const [fType, setFType] = useState();
  const [mType, setMType] = useState();
  const [created, setCreated] = useState();
  const [modified, setModified] = useState();
  const [size, setSize] = useState();
  const [dimensions, setDimensions] = useState([]);
  const [bucket, setBucket] = useState();
  const imgRef = useRef({});

  useEffect(() => {
    const setDefaultMetadata = async () => {
      const { metadata } = await getRoot(item).apiCall("candidateTaskMeta", {
        candidate_task_id,
      });
  
      if (metadata) {
        setFName(metadata.name.split('/').pop());
        setFType(metadata.contentType.split('/').shift());
        setMType(metadata.contentType);
        setCreated(metadata.timeCreated ? format(new Date(metadata.timeCreated), dateDisplayFormat) : "");
        setModified(metadata.updated ? format(new Date(metadata.updated), dateDisplayFormat) : "");
        setSize(`${new Intl.NumberFormat().format(parseInt(metadata.size))} bytes`);
        setBucket(metadata.bucket);
        setDimensions(Object.values(imgRef.current).map(ref => `${ref?.naturalWidth ?? 0} x ${ref?.naturalHeight ?? 0} px`));
      }
    };
    
    setDefaultMetadata();
  }, [candidate_task_id]);
  

  return (
    <Block name="candidate-task-view">
      <Elem name="data-display-container">
        {Object.entries(data).map( ([dataKey, dataValue]) => (
          <DataItemVisual key={dataKey} columns={columns} dataKey={dataKey} data={dataValue} ref={(ele) => imgRef.current[dataKey] = ele} />
        ))}
      </Elem>
      <Elem name="details">
        <Elem name="detailContainer">
          <Elem name="title">File Attributes</Elem>
          <Elem name="fname">{fName}</Elem>
        </Elem>
        <Elem name="detailContainer">
          <Elem name="detailSubContainer">
            <Elem name="subtitle">General</Elem>
            <Elem name="detailContent">
              <AttributeRow fieldName="ID:" value={id}/>
              <AttributeRow fieldName="File Type:" value={fType}/>
              <AttributeRow fieldName="Mime Type:" value={mType}/>
              <AttributeRow fieldName="Created:" value={created}/>
              <AttributeRow fieldName="Modified:" value={modified}/>
              <AttributeRow fieldName="Size:" value={size}/>
              <AttributeRow fieldName="Dimensions:" value={dimensions.map((dim, key) => <Elem key={key} name='dimension'>{dim}</Elem>)}/>
              <AttributeRow fieldName="Dataset:" value={dataset?.title}/>
            </Elem>
          </Elem>
          <Elem name="detailSubContainer">
            <Elem name="subtitle">Origin Storage</Elem>
            <Elem name="detailContent">
              <AttributeRow fieldName="Name:" value={fName}/>
              <AttributeRow fieldName="Bucket:" value={bucket}/>
              <AttributeRow fieldName="External ID:" value={candidate_task_id}/>
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