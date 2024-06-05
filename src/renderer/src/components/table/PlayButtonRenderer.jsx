import { useState, useEffect, useRef } from 'react';
import { CiPlay1, CiPause1 } from 'react-icons/ci';
import './styles/PlayButtonRenderer.css';

const PlayButtonRenderer = (props) => {
  const [play, setPlay] = useState(false);
  const audioRef = useRef(new Audio());

  const [track, setTrack] = useState({ trk: props.node.data.audiotrack, idx: props.node.rowIndex });
  const [playing, setPlaying] = useState(null);

  useEffect(() => {
    if (playing === track.idx) {
      audioRef.current.src = `streaming://${track.trk}`;
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [playing, track]);

  /*   const handleClick = async () => {
    console.log(props.node.rowIndex);
    setPlay((prevPlay) => {
      const newPlayState = !prevPlay;
      if (newPlayState) {
        console.log('play'); 
        audioRef.current.play();
      } else {
        console.log('pause'); 
        audioRef.current.pause();
      }
      console.log('new playState: ', newPlayState);
      return newPlayState;
    });
  }; */

  const handleClick = async () => {
    if (playing === track.idx) {
      // Pause the currently playing track
      audioRef.current.pause();
      setPlaying(null);
    } else {
      // Pause any other playing track and play the selected track
      setPlaying(track.idx);
    }
  };

  return (
    <button className="playButton" onClick={handleClick}>
      {playing === track.idx ? (
        <CiPause1 alt="Pause" className="playIcon" />
      ) : (
        <CiPlay1 alt="Play" className="playIcon" />
      )}
    </button>
  );
};

export default PlayButtonRenderer;
