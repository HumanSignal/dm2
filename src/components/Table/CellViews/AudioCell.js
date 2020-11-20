import React from "react";
import { SharedAudio } from "../../Common/SharedAudio";

export const AudioCell = (column) => {
  return <SharedAudio src={column.value} />;
};

Object.assign(AudioCell, {
  constraints: {
    maxWidth: 50,
    minWidth: 50,
    width: 50,
  },
});
