import { inject } from "mobx-react";
import React from "react";
import Running from "../../assets/running";

const injector = inject(({store}) => {
  return {
    SDK: store.SDK,
  };
});

export const Spinner = injector(({ SDK, visible = true, ...props }) => {
  const size = React.useMemo(() => {
    switch (props.size) {
      case "large":
        return 128;
      case "middle":
        return 48;
      case "small":
        return 24;
      default:
        return 48;
    }
  }, [props.size]);

  const source = React.useMemo(() => {
    return Running.full;
  }, [props.size]);

  const videoStyles = {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  };

  return visible ? (
    <div
      {...props}
      style={{ width: size, height: size }}
      children={
        <div style={{ width: "100%", height: "100%" }}>
          {SDK.spinner ?? (<img
            src={source.x1}
            srcSet={[`${source.x1} 1x`, `${source.x2} 2x`].join(",")}
            style={videoStyles}
            alt="opossum loader"
          />)}
        </div>
      }
    />
  ) : null;
});
