import { AudioPlayer } from "../Common/AudioPlayer/AudioPlayer";

export const AudioDataGroup = ({ value }) => {
  return (
    <div style={{ padding: 10, height: AudioDataGroup.height }}>
      <AudioPlayer src={value} />
    </div>
  );
};

AudioDataGroup.height = 42;
