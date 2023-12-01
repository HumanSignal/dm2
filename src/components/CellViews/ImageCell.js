import { getRoot } from "mobx-state-tree";
import { FF_LSDV_4711, isFF } from "../../utils/feature-flags";
import { AnnotationPreview } from "../Common/AnnotationPreview/AnnotationPreview";
import { useRef } from "react";
import { useImageProvider } from "../../providers/ImageProvider";

const imgDefaultProps = {};

if (isFF(FF_LSDV_4711)) imgDefaultProps.crossOrigin = 'anonymous';

export const ImageCell = (column) => {
  const {
    original,
    value,
    column: { alias },
  } = column;
  const root = getRoot(original);
  const imgRef = useRef();
  const { getImage } = useImageProvider();

  const renderImagePreview = original.total_annotations === 0 || !root.showPreviews;
  const imgSrc = Array.isArray(value) ? value[0] : value;

  if (!imgSrc) return null;
  getImage(imgSrc).then((loadedImage) => {
    if (imgRef.current && loadedImage.loaded && loadedImage.url) {
      imgRef.current.setAttribute("src", loadedImage.url);
      imgRef.current.style.display = "";
    }
  });

  return renderImagePreview ? (
    <img
      {...imgDefaultProps}
      ref={imgRef}
      key={imgSrc}
      alt="Data"
      style={{
        maxHeight: "100%",
        maxWidth: "100px",
        objectFit: "contain",
        borderRadius: 3,
        display: "none",
      }}
    />
  ) : (
    <AnnotationPreview
      task={original}
      annotation={original.annotations[0]}
      config={getRoot(original).SDK}
      name={alias}
      variant="120x120"
      fallbackImage={value}
      style={{
        maxHeight: "100%",
        maxWidth: "100px",
        objectFit: "contain",
        borderRadius: 3,
      }}
    />
  );
};
