import React from "react";
import styled, { css } from "styled-components";

const calculateWidth = (width, minWidth, maxWidth, initialX, currentX) => {
  const offset = currentX - initialX;

  // Limit the width
  return Math.max(minWidth ?? 30, Math.min(width + offset, maxWidth ?? 400));
};

export const Resizer = ({
  children,
  style,
  handleStyle,
  initialWidth,
  className,
  minWidth,
  maxWidth,
  showResizerLine,
  onResize: onResizeCallback,
  onResizeFinished,
  onReset,
}) => {
  const [width, setWidth] = React.useState(initialWidth ?? 150);
  const [isResizing, setIsResizing] = React.useState(false);
  const resizeHandler = React.useRef();

  /** @param {MouseEvent} evt */
  const handleResize = React.useCallback(
    (evt) => {
      const initialX = evt.pageX;
      let newWidth = width;

      /** @param {MouseEvent} evt */
      const onResize = (evt) => {
        newWidth = calculateWidth(
          width,
          minWidth,
          maxWidth,
          initialX,
          evt.pageX
        );

        setWidth(newWidth);
        onResizeCallback?.(newWidth);
      };

      const stopResize = (evt) => {
        document.removeEventListener("mousemove", onResize);
        document.removeEventListener("mouseup", stopResize);
        document.body.style.removeProperty("user-select");

        newWidth = calculateWidth(
          width,
          minWidth,
          maxWidth,
          initialX,
          evt.pageX
        );

        setIsResizing(false);

        if (newWidth !== width) {
          setWidth(newWidth);
          onResizeFinished?.(newWidth);
        }
      };

      document.addEventListener("mousemove", onResize);
      document.addEventListener("mouseup", stopResize);
      document.body.style.userSelect = "none";
      setIsResizing(true);
    },
    [maxWidth, minWidth, onResizeCallback, onResizeFinished, width]
  );

  const finalClassName = ["resizer", className].filter((c) => !!c).join(" ");

  return (
    <ResizerWrapper className={finalClassName} style={{ width }}>
      <div className="resizer__content" style={style ?? {}}>
        {children}
      </div>

      <ResizerHandle
        ref={resizeHandler}
        className="resizer__handle"
        style={handleStyle}
        isResizing={showResizerLine !== false && isResizing}
        onMouseDown={handleResize}
        onDoubleClick={() => onReset?.()}
      />
    </ResizerWrapper>
  );
};

const ResizerWrapper = styled.div`
  position: relative;
`;

const ResizerHandle = styled.div`
  top: 0;
  left: 100%;
  height: 100%;
  padding: 0 6px;
  position: absolute;
  cursor: col-resize;
  z-index: 100;

  &::before {
    top: 0;
    left: 0;
    bottom: 0;
    width: 1px;
    content: "";
    z-index: 5;
    display: block;
    background: #bdbdbd;
    position: absolute;
  }

  &:hover::before {
    top: -5px;
    bottom: -5px;
    background-color: #1890ff;
    box-shadow: -2px 0 0 0 rgba(24, 144, 255, 0.3),
      2px 0 0 0 rgba(24, 144, 255, 0.3);
  }

  ${({ isResizing }) =>
    isResizing
      ? css`
          &::after {
            top: 0;
            left: 0;
            width: 1px;
            content: "";
            z-index: 1;
            height: 9999px;
            position: absolute;
            background-color: #ccc;
          }
        `
      : ""}
`;
