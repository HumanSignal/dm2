import React, { MutableRefObject, Ref, useRef, useState } from "react";
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
  step = clamp(1, min, max),
  from = clamp(0, min, max),
  to = clamp(100, min, max),
  minDiff = 0,
  notchCount = 9,
}: SliderInterface) => {
  const fromRef = useRef<HTMLElement>();
  const toRef = useRef<HTMLElement>();
  const [currentFrom, setCurrentFrom] = useState(from);
  const [currentTo, setCurrentTo] = useState(to);
  const style = {
    "--from-pos": `${(from/max) * 100}%`,
    "--to-pos": `${(to/max) * 100}%`,
  }

  const mouseDownHandler = (ref : MutableRefObject<HTMLElement|undefined>) => {
    if (ref.current) {
      ref.current.style.setProperty("--handle-cursor", "grabbing");
    }
  }

  const mouseUpHandler = (ref : MutableRefObject<HTMLElement|undefined>) => {
    if (ref.current) {
      ref.current.style.setProperty("--handle-cursor", "");
    }
  }

  return (
    <Block name="sliderContainer" style={style}>
      <Elem name='fill' />
      <Elem name='notchContainer'>
        {[...Array(notchCount).keys()].map((index) => <Elem name='notch' key={index} />)}
      </Elem>
      <Elem name='handle' ref={fromRef} mod={{left: true}} onMouseDown={() => mouseDownHandler(fromRef)} onMouseUp={() => mouseUpHandler(fromRef)}/>
      <Elem name='handle' ref={toRef} mod={{right: true}} onMouseDown={() => mouseDownHandler(toRef)} onMouseUp={() => mouseUpHandler(toRef)}/>
    </Block>
  );
};
