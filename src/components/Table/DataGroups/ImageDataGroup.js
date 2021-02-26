import { getRoot } from "mobx-state-tree";
import React from "react";
import { AnnotationPreview } from "../../Common/AnnotationPreview/AnnotationPreview";

export const ImageDataGroup = (column) => {
  const {
    value,
    original,
    field: { alias },
  } = column;
  const root = getRoot(original);

  return original.total_completions === 0 || !root.showPreviews ? (
    <div>
      <img
        src={value}
        width="100%"
        height={ImageDataGroup.height}
        style={{ objectFit: "cover" }}
        alt=""
      />
    </div>
  ) : (
    <AnnotationPreview
      task={original}
      completion={original.completions[0]}
      config={getRoot(original).SDK}
      name={alias}
      width="100%"
      size="large"
      fallbackImage={value}
      height={ImageDataGroup.height}
      style={{ objectFit: "cover" }}
    />
  );
};

ImageDataGroup.height = 150;
