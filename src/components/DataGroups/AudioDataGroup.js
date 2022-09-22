import { AudioPlayer } from "../Common/MediaPlayer/MediaPlayer";

export const AudioDataGroup = ({ value }) => {
  return (
    <div style={{ padding: 10, height: AudioDataGroup.height }}>
      <AudioPlayer src={value} />
    </div>
  );
};

AudioDataGroup.height = 42;
