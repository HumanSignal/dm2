import React from "react";
import { SharedAudio } from "../../Common/SharedAudio";

export const AudioCell = (column) => {
  return <SharedAudio src={column.value} />;
};

AudioCell.style = {
  width: 50,
};
