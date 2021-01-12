/* eslint-disable import/no-webpack-loader-syntax */

import Running from "!!url-loader!../../assets/running.webm";
import { Spin } from "antd";
import React from "react";

export const Spinner = ({ ...props }) => {
  const size = React.useMemo(() => {
    switch (props.size) {
      case "large":
        return 64;
      default:
      case "middle":
        return 36;
      case "small":
        return 22;
    }
  }, [props.size]);

  return (
    <Spin
      {...props}
      style={{ width: size, height: size }}
      indicator={
        <div style={{ width: "100%", height: "100%" }}>
          <video
            src={Running}
            autoPlay
            loop
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              transform: "scale(1.3)",
            }}
          ></video>
        </div>
      }
      spinning={true}
    />
  );
};
