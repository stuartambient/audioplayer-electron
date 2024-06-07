import React from 'react';
import { useAudio } from './AudioContext';
import './styles/TableAudioControls.css';

const TableAudioControls = () => {
  const { stopTrack, volume, changeVolume } = useAudio();

  const handleVolumeChange = (event) => {
    changeVolume(event.target.value);
  };

  return (
    <div className="centralControlContainer">
      <button onClick={stopTrack} className="stopButton">
        Stop
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={handleVolumeChange}
        className="volumeSlider"
      />
    </div>
  );
};

export default TableAudioControls;
