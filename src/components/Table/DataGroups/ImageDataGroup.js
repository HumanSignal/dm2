import React from "react";

export const ImageDataGroup = ({ value }) => {
  return (
    <div>
      <img
        src={value}
        width="100%"
        height={ImageDataGroup.height}
        style={{ objectFit: "cover" }}
        alt=""
      />
    </div>
  );
};

ImageDataGroup.height = 150;
