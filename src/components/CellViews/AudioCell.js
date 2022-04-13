import { AudioPlayer } from "../Common/AudioPlayer/AudioPlayer";

export const AudioCell = (column) => {
  return <AudioPlayer src={column.value} />;
};

AudioCell.style = {
  width: 50,
  minWidth: 240,
};

/* Audio Plus */

export const AudioPlusCell = (column) => {
  return <AudioPlayer src={column.value} />;
};

AudioPlusCell.style = {
  width: 240,
  minWidth: 240,
};

AudioPlusCell.userSelectable = false;
