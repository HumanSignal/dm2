import { inject, observer } from "mobx-react";
import React from "react";
import { Block } from "../../../utils/bem";
import { Space } from "../../Common/Space/Space";
import "./TabPanel.styl";

const injector = inject(({store}) => {
  return {
    store,
    instruments: store.toolbarInstruments,
    version: store.instrumentsVersion,
  };
});

export const Toolbar = injector(observer(({store, instruments}) => {
  return (
    <Block name="tab-panel">
      {instruments.map((section, i) => {
        console.log({section});
        return (
          <Space size="small" key={`section-${i}`}>
            {section.map((instrument, i) => {
              const Instrument = store.getInstrument(instrument);

              return Instrument ? (
                <Instrument
                  key={`instrument-${instrument}-${i}`}
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

