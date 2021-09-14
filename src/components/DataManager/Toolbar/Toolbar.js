import { inject, observer } from "mobx-react";
import React from "react";
import { Block } from "../../../utils/bem";
import { Space } from "../../Common/Space/Space";
import "./TabPanel.styl";

const injector = inject(({ store }) => {
  return {
    store,
  };
});

export const Toolbar = injector(observer(({ store }) => {
  return (
    <Block name="tab-panel">
      {store.SDK.toolbarInstruments.map((section, i) => {
        return (
          <Space size="small" key={`section-${i}`}>
            {section.map((instrument, i) => {
              const Instrument = store.SDK.getInstrument(instrument);

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

