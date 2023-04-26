import React, { MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import { Block, Elem } from "../../../utils/bem";
import { clamp } from "../../../utils/helpers";
import "./Slider.styl";

interface SliderInterface {
  onFromChange?: (number: number) => void,
  onToChange?: (number: number) => void,
  from?: number,
  to?: number,
  min?: number,
  max?: number,
  step?: number,
  minDiff?: number,
  notchCount?: number,
};

export const Slider = ({
  onFromChange,
  onToChange,
  min = 0,
  max = 100,
  from = clamp(0, min, max),
  to = clamp(100, min, max),
  minDiff = 0,
  notchCount = 9,
}: SliderInterface) => {
  const fromRef = useRef<HTMLElement>();
  const toRef = useRef<HTMLElement>();
  const containerRef = useRef<HTMLElement>();
  const currentRef = useRef<HTMLElement>();
  const [currentFrom, setCurrentFrom] = useState(from);
  const [currentTo, setCurrentTo] = useState(to);
  const [draggingLeft, setDraggingLeft] = useState(true);
  const style = {
    "--from-pos": `${(currentFrom/max) * 100}%`,
    "--to-pos": `${(currentTo/max) * 100}%`,
  }

  const mouseDownHandler = (ref : MutableRefObject<HTMLElement|undefined>, isLeft : boolean) => {
    if (ref.current) {
      currentRef.current = ref.current;
      setDraggingLeft(isLeft);
      ref.current.style.setProperty("--handle-cursor", "grabbing");
    }
  }

  const mouseUpHandler = useCallback(() => {
    if (currentRef.current) {
      currentRef.current.style.setProperty("--handle-cursor", "");
      currentRef.current = undefined;
      draggingLeft ? onFromChange?.(currentFrom) : onToChange?.(currentTo);
    }
  }, [draggingLeft, currentFrom, currentTo, onFromChange, onToChange]);

  const mouseMoveHandler = useCallback((e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (containerRef.current && currentRef.current) {
      const containerBoundingClientRect = containerRef?.current?.getBoundingClientRect?.();
      const eleWidth = containerBoundingClientRect?.width;
      const eleLeft = e.clientX - (containerBoundingClientRect?.x ?? 0);
      const newPos = Math.round(((eleLeft + (minDiff/eleWidth))/eleWidth) * max);
      const clampedPos = clamp(newPos, min, max);

      draggingLeft ? setCurrentFrom(clampedPos) : setCurrentTo(clampedPos);
    }
  }, [draggingLeft, minDiff, min, max]);

  return (
    <Block name="sliderContainer" ref={containerRef} style={style} onMouseMove={mouseMoveHandler} onDrop={() => mouseUpHandler()}>
      <Elem name='fill' />
      <Elem name='notchContainer'>
        {[...Array(notchCount).keys()].map((index) => <Elem name='notch' key={index} />)}
      </Elem>
      <Elem name='handle' ref={fromRef} mod={{left: true}} 
        onMouseDown={() => mouseDownHandler(fromRef, true)} 
        onMouseUp={() => mouseUpHandler()}
        // onDragStart={(e: MouseEvent) => dragStartHandler(fromRef, e)}
        // onDrop={(e: MouseEvent) => dropHandler(fromRef, e)}
        draggable
        droppable="droppable"
      />
      <Elem name='handle' ref={toRef} mod={{right: true}} 
        onMouseDown={() => mouseDownHandler(toRef, false)} 
        onMouseUp={() => mouseUpHandler()}
        // onDragStart={(e: MouseEvent) => dragStartHandler(toRef, e)}
        // onDrop={(e: MouseEvent) => dropHandler(toRef, e)}
        draggable
        droppable="droppable"
      />
    </Block>
  );
};
