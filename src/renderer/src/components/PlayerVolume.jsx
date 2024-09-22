import { useState, useRef, useEffect } from 'react';
import { useAudioPlayer } from '../AudioPlayerContext';

const PlayerVolume = () => {
  const { state, dispatch } = useAudioPlayer();
  const volumebarOutline = useRef();
  const volumeslider = useRef();

  return (
    <div className="volume-outline" onMouseMove={handleVolume} ref={volumebarOutline}>
      <div className="volumebar" ref={volumeslider}></div>
    </div>
  );
};

export default PlayerVolume;
