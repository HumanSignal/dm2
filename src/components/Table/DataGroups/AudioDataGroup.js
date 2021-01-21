import React from "react";
import { SharedAudio } from "../../Common/SharedAudio";

export const AudioDataGroup = ({ value }) => {
  return (
    <div style={{ padding: 5, height: AudioDataGroup.height }}>
      <SharedAudio src={value} />
    </div>
  );
};

AudioDataGroup.height = 42;
