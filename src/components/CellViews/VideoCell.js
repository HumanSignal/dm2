import { MediaPlayer } from "../Common/MediaPlayer/MediaPlayer";

export const VideoCell = (column) => {
  return <MediaPlayer src={column.value} video />;
};

VideoCell.style = {
  width: 50,
  minWidth: 240,
};

