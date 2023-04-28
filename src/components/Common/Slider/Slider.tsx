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
  minDiff?: number,
  notchCount?: number,
}

export const Slider = ({
  onFromChange,
  onToChange,
  min = 0,
  max = 100,
  from = min,
  to = max,
  minDiff = 0,
  notchCount = 9,
}: SliderInterface) => {
  const fromRef = useRef<HTMLElement>();
  const toRef = useRef<HTMLElement>();
  const containerRef = useRef<HTMLElement>();
  const currentRef = useRef<HTMLElement>();
  const currentFromRef = useRef<number>(from);
  const currentToRef = useRef<number>(to);
  const draggingLeftRef = useRef<boolean>(true);
  const [currentFrom, _setCurrentFrom] = useState(from);
  const [currentTo, _setCurrentTo] = useState(to);
  const style = {
    "--from-pos": `${((currentFrom)/max) * 100}%`,
    "--to-pos": `${((currentTo)/max) * 100}%`,
  };
  const setCurrentFrom = (newVal : number) => {
    const clampedVal = clamp(newVal, min, Math.min(currentToRef.current, max));

    currentFromRef.current = clampedVal;
    _setCurrentFrom(clampedVal);
  };
  const setCurrentTo = (newVal : number) => {
    const clampedVal = clamp(newVal, Math.max(currentFromRef.current, min), max);

    currentToRef.current = clampedVal;
    _setCurrentTo(clampedVal);
  };

  const mouseDownHandler = (ref : MutableRefObject<HTMLElement|undefined>, isLeft : boolean) => {
    if (ref.current) {
      currentRef.current = ref.current;
      draggingLeftRef.current = isLeft;
      ref.current.style.setProperty("--handle-cursor", "grabbing");
      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);
    }
  };

  const mouseUpHandler = useCallback(() => {
    if (currentRef.current) {
      currentRef.current.style.setProperty("--handle-cursor", "");
      currentRef.current = undefined;
      draggingLeftRef.current ? onFromChange?.(currentFromRef.current) : onToChange?.(currentToRef.current);
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.removeEventListener("mouseup", mouseUpHandler);
    }
  }, [onFromChange, onToChange]);

  const mouseMoveHandler = useCallback((e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (containerRef.current && currentRef.current) {
      document.removeEventListener("mouseup", mouseUpHandler);
      const containerBoundingClientRect = containerRef?.current?.getBoundingClientRect?.();
      const eleWidth = containerBoundingClientRect?.width;
      const eleLeft = e.clientX - (containerBoundingClientRect?.x ?? 0);
      const newPos = Math.round(((eleLeft + (minDiff/eleWidth))/eleWidth) * max);

      draggingLeftRef.current ? setCurrentFrom(newPos) : setCurrentTo(newPos);
      document.addEventListener("mouseup", mouseUpHandler);
    }
  }, [minDiff, min, max]);

  return (
    <Block name="sliderContainer" ref={containerRef} style={style} droppable="droppable">
      <Elem name='fill' />
      <Elem name='notchContainer'>
        {[...Array(notchCount).keys()].map((index) => <Elem name='notch' key={index} />)}
      </Elem>
      <Elem name='handle' ref={fromRef} mod={{ left: true }} 
        onMouseDown={() => mouseDownHandler(fromRef, true)} 
        draggable
      />
      <Elem name='handle' ref={toRef} mod={{ right: true }} 
        onMouseDown={() => mouseDownHandler(toRef, false)} 
        draggable
      />
    </Block>
  );
};
