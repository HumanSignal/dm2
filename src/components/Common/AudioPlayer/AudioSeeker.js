import { useEffect, useRef } from "react";
import { Block, Elem } from "../../../utils/bem";
import "./AudioSeeker.styl";

export const AudioSeeker = ({ currentTime, duration, buffer, onSeekStart, onSeekEnd, onChange }) => {
  const progress = (duration && currentTime) ? (currentTime / duration) * 100 : 0;
  /** @type {import("react").RefObject<HTMLElement>} */
  const seekerRef = useRef();

  useEffect(() => {
    /**
     * @param {MouseEvent} e
     */
    const handleMouseDown = (e) => {
      if (e.target === seekerRef.current || e.target.contains(seekerRef.current)) {
        e.stopPropagation();
        e.preventDefault();

        const {left, width} = seekerRef.current.getBoundingClientRect();
        const initialX = e.pageX - (left + 5);
        const clickedProgress = duration * Math.max(0, Math.min(initialX / width, 1));

        const seekProgress = (e) => {
          const newX = e.pageX - (left + 5);
          const newProgress = duration * Math.max(0, Math.min(newX / width, 1));
          onChange(newProgress);
        };

        const cancelEvents = (e) => {
          e.stopPropagation();
          e.preventDefault();

          document.removeEventListener('mousemove', seekProgress);
          document.removeEventListener('mouseup', cancelEvents);
          onSeekEnd?.();
        };

        document.addEventListener('mousemove', seekProgress);
        document.addEventListener('mouseup', cancelEvents);

        onSeekStart?.();
        onChange?.(clickedProgress);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [seekerRef]);

  return (
    <Block name="audio-seeker" ref={seekerRef}>
      <Elem name="progress" style={{width: `${progress}%`}}/>
    </Block>
  );
};
