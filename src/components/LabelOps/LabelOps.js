
// import ColorScheme from "pleasejs";
import React, { Fragment } from "react";
import { observer } from "mobx-react";
import { Collapse, Card, Checkbox, List, Avatar, Typography, Tag } from 'antd';
import styles from "./LabelOps.module.scss";
// import Utils from "../../utils";

const { Title, Text } = Typography;
const { Panel } = Collapse;

export default observer(({ store, completion }) => {

    const ops = store.operationsStore;
    
    const badge = (num) =>
          <span className={styles.confbadge}>
            {num.toFixed(2)}
          </span>;

    let title = (
        <div className={styles.title + " " + styles.titlespace}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <h3>Labeling Operations</h3>
          </div>
        </div>
    );

    let itemRender = (item) => (
        <List.Item>
          <List.Item.Meta
            title={
                <div>
                <Text code>{item.lopFactor}</Text>
                <Tag style={{
                    // backgroundColor: ColorScheme.make_color({ seed: item.lopLabel })[0],
                      // color: "white",
                      margin: "5px",
                  }}
                       size={item.size}
                  >
                    {item.lopLabel}
                </Tag>
                </div>
            }
            description={
                <div>
                  <span>Coverage: {badge(item.coverage)}</span>&nbsp;
                  <span>Conflict: {badge(item.conflict)}</span>
                </div>
            }
          />
                    <Checkbox onChange={item.toggleSelected}></Checkbox>

        </List.Item>
    );

    const prevOps = ops.previousOps;
    const currOps = ops.currentOps;
    
    return (
        <div>
          <Card title={title} size="small" bodyStyle={{ padding: "0", paddingTop: "1px" }}>
            <Collapse defaultActiveKey={['current']}>
              <Panel header={"Previous (" + ops.previousSelectedNum + "/" + prevOps.length + ")"} key="previous">
                <List itemLayout="horizontal"
                      dataSource={prevOps}
                      renderItem={itemRender} />
              </Panel>
              <Panel header={"Current (" + ops.currentSelectedNum + "/" + currOps.length + ")"} key="current">
                <List itemLayout="horizontal"
                      dataSource={currOps}
                      renderItem={itemRender} />
              </Panel>

            </Collapse>
          </Card>
        </div>
    );
});
