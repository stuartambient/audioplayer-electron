import { useState, useEffect, useRef } from 'react';
import { CiPlay1, CiPause1 } from 'react-icons/ci';
import './styles/PlayButtonRenderer.css';

const PlayButtonRenderer = (props) => {
  console.log('props: ', props, 'id: ', props.node.id, 'rowIndex: ', props.rowIndex);
  console.log('row node: ', props.api.getRowNode(props.node.id));
  /* const [playing, setPlaying] = useState(false); */
  const [playing, setPlaying] = useState(props.node.data.playing);
  const audioRef = useRef(new Audio());
  const track = props.node.data.audiotrack;
  /* const rowIndex = props.node.data.track_id; */
  /**/ /* const trackId = props.node.data.track_id; // Unique ID for each row */
  /**/ /* const playing = props.node.data.playing; // Play state from row data */

  useEffect(() => {
    const handleReset = () => {
      audioRef.current.pause();
      setPlaying(false);
    };

    window.addEventListener('resetAudio', handleReset);

    return () => {
      window.removeEventListener('resetAudio', handleReset);
    };
  }, []);

  useEffect(() => {
    if (playing && track) {
      audioRef.current.src = `streaming://${track}`;
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
    props.node.setDataValue('playing', playing);
  }, [playing, track]);

  const handleClick = () => {
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      const event = new Event('resetAudio');
      window.dispatchEvent(event);
      setPlaying(true);
    }
  };

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
