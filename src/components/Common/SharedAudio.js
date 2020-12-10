import { Button, Slider } from "antd";
import moment from "moment";
import React, { Component } from "react";
import { FaPause, FaPlay } from "react-icons/fa";

const Duration = ({ value, units, format }) =>
  moment.duration(value, units).format(format, {
    trim: false,
  });

const PlaybackControl = ({ current, max, onChange, separator = " / " }) => {
  const format = React.useMemo(() => {
    if (max >= 3600) {
      return "hh:mm:ss";
    } else {
      return "mm:ss";
    }
  }, [max]);

  return (
    <>
      <div style={{ padding: "0 10px" }}>
        <Duration value={current} units="seconds" format={format} />
        {separator}
        <Duration value={max} units="seconds" format={format} />
      </div>
      <Slider
        min={0}
        max={max}
        step={0.01}
        value={current}
        style={{ flex: 1 }}
        onChange={onChange}
        tipFormatter={(value) => (
          <Duration value={value} units="seconds" format={format} />
        )}
      />
    </>
  );
};

let currentPlayer;

export class SharedAudio extends Component {
  /** @type {string} */
  src = null;

  state = {
    paused: true,
    duration: 0,
    current: 0,
    volume: 0.5,
    audio: null,
    idle: true,
  };

  componentWillUnmount() {
    if (this.audio) this.destroy();
  }

  render() {
    const paused = this.state.paused || this.state.audio === null;

    return (
      <div
        style={{ display: "flex", width: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          onClick={paused ? this.play : this.pause}
          className="flex-button"
        >
          {paused ? <FaPlay /> : <FaPause />}
        </Button>
        {this.audio && !this.state.idle ? (
          <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
            <PlaybackControl
              units="seconds"
              max={this.state.duration}
              current={this.state.current}
              onChange={(time) => (this.audio.currentTime = time)}
            />
          </div>
        ) : (
          <div>{this.props.src}</div>
        )}
      </div>
    );
  }

  play = () => {
    this.setState({ ...this.state, idle: false });
    this.createAudioElement(() => this.audio.play());
  };

  pause = () => {
    this.createAudioElement(() => this.audio.pause());
  };

  createAudioElement(callback) {
    if (currentPlayer === this) {
      callback();
      return;
    }

    currentPlayer?.destroy();
    currentPlayer = this;

    const audio = new Audio(this.props.src);
    document.body.appendChild(audio);
    console.log({ audio });

    audio.classList.add("dm-audio");
    audio.currentTime = 0;
    audio.volume = this.state.volume;

    audio.onpause = () => this.setState({ ...this.state, paused: true });
    audio.onplay = () => this.setState({ ...this.state, paused: false });
    audio.ontimeupdate = () =>
      this.setState({ ...this.state, current: audio.currentTime });
    audio.ondurationchange = () =>
      this.setState({ ...this.state, duration: audio.duration });

    this.setState(
      {
        audio,
        duration: audio.duration,
        current: audio.currentTime,
        paused: audio.paused,
      },
      callback
    );
  }

  destroy() {
    if (this.audio) {
      this.audio.pause();

      this.audio.onpause = null;
      this.audio.onplay = null;
      this.audio.ontimeupdate = null;
      this.audio.ondurationchange = null;

      this.audio.remove();
      this.audio = null;
    }
  }

  get audio() {
    return this.state.audio;
  }

  /**
   * @param {HTMLAudioElement} value
   */
  set audio(value) {
    this.setState({ ...this.state, audio: value });
    return value;
  }
}
