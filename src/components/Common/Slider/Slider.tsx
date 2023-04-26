import React, { useRef, useState } from "react";
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
}: SliderInterface) => {
  const fromRef = useRef();
  const toRef = useRef();
  const [currentFrom, setCurrentFrom] = useState(from);
  const [currentTo, setCurrentTo] = useState(to);
  const style = {
    "--from-pos": `${(from/max) * 100}%`,
    "--to-pos": `${(to/max) * 100}%`,
  }

  return (
    <Block name="sliderContainer" style={style}>
      <Elem name='fill' />
      <Elem name='handle' ref={fromRef} mod={{left: true}} />
      <Elem name='handle' ref={toRef} mod={{right: true}} />
    </Block>
  );
};
