import React from "react";
import { useSDK } from "../../providers/SDKProvider";
import { Button } from "./Button/Button";
import { Block } from "../../utils/bem";
import { Tooltip } from "./Tooltip/Tooltip";

const SDKButton = ({ eventName, ...props }) => {
  const sdk = useSDK();

  return sdk.hasHandler(eventName) ? (
    <Tooltip
      title="You must upgrade your plan to import data"
      style={{
        maxWidth:200,
        textAlign: "center",
      }}
      disabled={!props.isSelfServeExpired}>
      <Block name="button-wrapper">
        <Button
          {...props}
          disabled={ props.disabled || props.isSelfServeExpired }
          onClick={() => {
            sdk.invoke(eventName);
          }}
        />
      </Block>
    </Tooltip>
  ) : null;
};

export const SettingsButton = ({ ...props }) => {
  return <SDKButton {...props} eventName="settingsClicked" />;
};

export const ImportButton = ({ ...props }) => {
  return <SDKButton {...props} eventName="importClicked" />;
};

export const ExportButton = ({ ...props }) => {
  return <SDKButton {...props} eventName="exportClicked" />;
};
