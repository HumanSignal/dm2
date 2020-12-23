import React from "react";
import styled, { css } from "styled-components";

const calculateWidth = (width, initialX, currentX) => {
  const offset = currentX - initialX;

  // Limit the width
  return Math.max(30, Math.min(width + offset, 400));
};

export const Resizer = ({
  children,
  style,
  handleStyle,
  initialWidth,
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
        newWidth = calculateWidth(width, initialX, evt.pageX);

        setWidth(newWidth);
        onResizeCallback?.(newWidth);
      };

      const stopResize = (evt) => {
        document.removeEventListener("mousemove", onResize);
        document.removeEventListener("mouseup", stopResize);

        newWidth = calculateWidth(width, initialX, evt.pageX);

        setIsResizing(false);

        if (newWidth !== width) {
          setWidth(newWidth);
          onResizeFinished?.(newWidth);
        }
      };

      document.addEventListener("mousemove", onResize);
      document.addEventListener("mouseup", stopResize);
      setIsResizing(true);
    },
    [onResizeCallback, onResizeFinished, width]
  );

  return (
    <ResizerWrapper className="resizer" style={{ width }}>
      <div className="resizer__content" style={style ?? {}}>
        {children}
      </div>

      <ResizerHandle
        ref={resizeHandler}
        className="resizer__handle"
        style={handleStyle}
        isResizing={isResizing}
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
