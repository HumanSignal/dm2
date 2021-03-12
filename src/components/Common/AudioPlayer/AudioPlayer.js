import { createRef, useCallback, useMemo, useReducer, useRef } from "react";
import { FaPause, FaPlay } from "react-icons/fa";
import { Block, Elem } from "../../../utils/bem";
import { filename } from "../../../utils/helpers";
import { Space } from "../Space/Space";
import { Spinner } from "../Spinner";
import "./AudioPlayer.styl";
import { AudioSeeker } from "./AudioSeeker";
import { Duration } from "./Duration";

const initialState = {
  duration: 0,
  currentTime: 0,
  buffer: null,
  error: false,
  loaded: false,
  playing: false,
  loading: false,
};

const globalAudioRef = createRef();

export const AudioPlayer = ({ src }) => {
  /** @type {import("react").RefObject<HTMLAudioElement>} */
  const audio = useRef();
  const wasPlaying = useRef(false);

  const [state, dispatch] = useReducer((state, action) => {
    console.log(action.type);
    switch(action.type) {
      case "duration": return { ...state, duration: action.payload };
      case "current": return { ...state, currentTime: action.payload };
      case "loaded": return { ...state, loaded: true };
      case "error": return { ...state, error: true };
      case "play": return { ...state, playing: true };
      case "pause": return { ...state, playing: false };
      case "buffer": return { ...state, buffer: action.payload };
    }
  }, initialState);

  const format = useMemo(() => {
    if (state.duration >= 3600) {
      return ["hours", "minutes", "seconds"];
    } else {
      return ["minutes", "seconds"];
    }
  }, [state.duration]);

  const play = useCallback(() => {
    audio?.current?.play?.();
  }, [audio]);

  const pause = useCallback(() => {
    audio?.current?.pause?.();
  }, [audio]);

  const togglePlay = useCallback(() => {
    globalAudioRef.current?.pause();
    state.playing ? pause() : play();
    globalAudioRef.current = audio.current;
  }, [audio, state]);

  const onSeekStart = useCallback(() => {
    console.log(state.playing);
    wasPlaying.current = state.playing;
    console.log(wasPlaying.current, state.playing);
    if (state.playing) audio.current.pause();
  }, [audio, state, wasPlaying]);

  const onSeekEnd = useCallback(() => {
    console.log(wasPlaying.current);
    if (wasPlaying.current) {
      audio.current.play();
    }
  }, [audio, wasPlaying]);

  const onSeek = useCallback((time) => {
    audio.current.currentTime = time;
  }, [audio]);

  return (
    <Block name="player" onClick={e => e.stopPropagation()}>
      {state.error ? (
        <Elem name="loading">
          Unable to play
        </Elem>
      ) : state.loaded ? (
        <Elem name="playback">
          <Elem name="controls" tag={Space} spread>
            <Space size="small">
              <Elem name="play" onClick={togglePlay}>
                {state.playing ? <FaPause/> : <FaPlay/>}
              </Elem>
              <Elem name="track">
                {filename(src)}
              </Elem>
            </Space>
            <Elem tag={Space} size="small" name="time">
              <Duration value={state.currentTime} format={format}/>
              {" / "}
              <Duration value={state.duration} format={format}/>
            </Elem>
          </Elem>

          <AudioSeeker
            currentTime={state.currentTime}
            duration={state.duration}
            buffer={state.buffer}
            onSeekStart={onSeekStart}
            onSeekEnd={onSeekEnd}
            onChange={onSeek}
          />
        </Elem>
      ) : (
        <Elem name="loading">
          <Spinner size="24"/>
        </Elem>
      )}

      <audio
        ref={audio}
        controls={false}
        preload="metadata"
        onPlay={() => dispatch({ type: 'play' })}
        onPause={() => dispatch({ type: 'pause' })}
        onTimeUpdate={() => dispatch({ type: "current", payload: audio.current.currentTime })}
        onDurationChange={() => dispatch({ type: "duration", payload: audio.current.duration })}
        onCanPlay={() => dispatch({ type: "loaded"})}
        onProgress={() => dispatch({ type: "buffer", payload: audio.current.buffered })}
        onError={() => dispatch({ type: "error" })}
      >
        <source src={src} type="audio/wav"/>
      </audio>
    </Block>
  );

};
