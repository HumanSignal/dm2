import { inject, observer } from "mobx-react";
import React from "react";
import { Block } from "../../../utils/bem";
import { Space } from "../../Common/Space/Space";
import "./TabPanel.styl";

const injector = inject(({store}) => {
  return {
    store,
    instruments: store.toolbarInstruments,
  };
});

export const Toolbar = injector(observer(({store, instruments}) => {
  return (
    <Block name="tab-panel">
      {instruments.map((section, i) => {
        return (
          <Space size="small" key={`section-${i}`}>
            {section.map(instrument => {
              const Instrument = store.getInstrument(instrument);

              return Instrument ? (
                <Instrument
                  key={`instrument-${instrument}`}
                  size="medium"
                />
              ) : null;
            })}
          </Space>
        );
      })}
    </Block>
  );
}));

