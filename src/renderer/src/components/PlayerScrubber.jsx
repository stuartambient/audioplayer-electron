import { useState, useRef, useEffect } from 'react';
import { useAudioPlayer } from '../AudioPlayerContext';
import {
  convertDuration,
  convertDurationSeconds,
  convertCurrentTime,
  convertToSeconds
} from '../hooks/useTime';

const PlayerScrubber = () => {
  const { state, dispatch } = useAudioPlayer();
  const [cTime, setCTime] = useState('00:00');
  const [progbarInc, setProgbarInc] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const seekbarOutline = useRef();
  const seekbar = useRef();

  useEffect(() => {
    const outlineWidth = seekbarOutline.current.clientWidth;
    const convertForProgbar = convertToSeconds(state.duration, cTime);
    setProgbarInc(convertForProgbar * outlineWidth);
  }, [state.duration, cTime]);

  useEffect(() => {
    state.audioRef.current.ontimeupdate = () => {
      if (!isDragging) {
        setCTime(convertCurrentTime(state.audioRef.current));
      }
    };
  }, [state.audioRef, isDragging]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const outlineRect = seekbarOutline.current.getBoundingClientRect();
    const outlineWidth = outlineRect.width;
    const clickPosition = e.clientX - outlineRect.left;

    if (clickPosition >= 0 && clickPosition <= outlineWidth) {
      state.audioRef.current.currentTime =
        (convertDurationSeconds(state.duration) / outlineWidth) * clickPosition;
      setProgbarInc(clickPosition);
      setCTime(convertCurrentTime(state.audioRef.current));
    }
  };

  const handleMouseUp = (e) => {
    if (isDragging) {
      handleSeekTime(e);
    }
    setIsDragging(false);
  };

  useEffect(() => {
    updateSliderWidth(state.volume);
  }, []);

  const handleSeekTime = (e) => {
    const totaltime = convertDurationSeconds(state.duration);
    const seekbarOutlineWidth = seekbarOutline.current.clientWidth;
    const seekPoint = e.clientX - seekbarOutline.current.getBoundingClientRect().left;

    state.audioRef.current.currentTime = (totaltime / seekbarOutlineWidth) * seekPoint;
  };

  <div
    className="seekbar-outline"
    /* id="waveform" */
    id="waveform"
    ref={seekbarOutline}
    onMouseDown={handleMouseDown}
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
    onMouseLeave={handleMouseUp}
  >
    <div
      className="seekbar"
      ref={seekbar}
      style={{ width: progbarInc ? `${progbarInc}px` : null }}
    ></div>
  </div>;
};

export default PlayerScrubber;
