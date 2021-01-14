import React from "react";
import { SharedAudio } from "../../Common/SharedAudio";

export const AudioCell = (column) => {
  return <SharedAudio src={column.value} />;
};

AudioCell.style = {
  width: 50,
  minWidth: 150,
  maxWidth: 150,
};

/* Audio Plus */

export const AudioPlusCell = (column) => {
  return <SharedAudio src={column.value} />;
};

AudioPlusCell.style = {
  width: 50,
  minWidth: 150,
  maxWidth: 150,
};

AudioPlusCell.userSelectable = false;
