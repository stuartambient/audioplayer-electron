import React, { useEffect, useState } from 'react';
import { CiPlay1, CiPause1 } from 'react-icons/ci';
import { useAudio } from './AudioContext';
import './styles/PlayButtonRenderer.css';

const PlayButtonRenderer = (props) => {
  const { currentTrack, playTrack } = useAudio();
  const track = props.node.data.audiotrack;

  const playing = currentTrack === track;

  const handleClick = () => {
    playTrack(track);
  };

  /*   const handleStopClick = () => {
    stopTrack();
  }; */

  return (
    <button className="playButton" onClick={handleClick}>
      {playing ? (
        <CiPause1 alt="Pause" className="playIcon" />
      ) : (
        <CiPlay1 alt="Play" className="playIcon" />
      )}
    </button>
  );
};

export default PlayButtonRenderer;
