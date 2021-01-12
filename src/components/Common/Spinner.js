/* eslint-disable import/no-webpack-loader-syntax */

import { Spin } from "antd";
import React from "react";
import Running from "../../assets/running";

export const Spinner = ({ ...props }) => {
  const size = React.useMemo(() => {
    switch (props.size) {
      case "large":
        return 64;
      case "middle":
        return 48;
      case "small":
        return 24;
      default:
        return 48;
    }
  }, [props.size]);

  const source = React.useMemo(() => {
    switch (props.size) {
      case "large":
        return Running["64"];
      case "middle":
        return Running["48"];
      case "small":
        return Running["24"];
      default:
        return Running["48"];
    }
  }, [props.size]);

  const videoStyles = {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  };

  return (
    <Spin
      {...props}
      style={{ width: size, height: size }}
      indicator={
        <div style={{ width: "100%", height: "100%" }}>
          <img
            src={source.x1}
            srcSet={[`${source.x1} 1x`, `${source.x2} 2x`].join(",")}
            style={videoStyles}
            alt="opossum loader"
          />
        </div>
      }
      spinning={true}
    />
  );
};
