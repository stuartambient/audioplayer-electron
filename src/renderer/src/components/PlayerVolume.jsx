import { useState, useRef, useEffect } from 'react';
import { useAudioPlayer } from '../AudioPlayerContext';

const PlayerVolume = () => {
  const { state, dispatch } = useAudioPlayer();
  const volumebarOutline = useRef();
  const volumeslider = useRef();

  const updateSliderWidth = (currentVolume) => {
    const outlineRect = volumebarOutline.current.getBoundingClientRect();
    const outlineWidth = Math.round(outlineRect.width);

    const percentageWidth = currentVolume * 100;
    volumeslider.current.setAttribute('style', `width:${percentageWidth}%;`);
  };

  const handleVolume = (e) => {
    if (e.buttons !== 1) return;

    const outlineRect = volumebarOutline.current.getBoundingClientRect();
    const outlineWidth = Math.round(outlineRect.width);
    const widthRange = e.clientX - volumebarOutline.current.offsetLeft;

    if (widthRange >= 0 && widthRange <= outlineWidth) {
      const mark = widthRange / outlineWidth;
      state.audioRef.current.volume = Math.round(mark * 1000) / 1000;
      volumeslider.current.setAttribute('style', `width:${mark * 100}%;`);
    } else {
      return;
    }
  };

  useEffect(() => {
    updateSliderWidth(state.volume);
  }, []);

  return (
    <div className="volume-outline" onMouseMove={handleVolume} ref={volumebarOutline}>
      <div className="volumebar" ref={volumeslider}></div>
    </div>
  );
};

export default PlayerVolume;
