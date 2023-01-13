import { useState, useRef, useEffect } from 'react';

import {
  convertDuration,
  convertDurationSeconds,
  convertCurrentTime,
  convertToSeconds
} from '../hooks/useTime';
import { FaHeart, FaBackward, FaForward, FaListUl } from 'react-icons/fa';
import { GiPauseButton, GiPlayButton } from 'react-icons/gi';
import '../style/Player.css';

const Player = ({
  title,
  cover,
  delay,
  artist,
  album,
  duration,
  currentTime,
  pause,
  onClick,
  audioRef,
  library
}) => {
  useEffect(() => {
    const outlineWidth = seekbarOutline.current.clientWidth;
    const convertForProgbar = convertToSeconds(duration, currentTime);
    /* console.log(convertForProgbar * outlineWidth); */
    setProgbarInc(convertForProgbar * outlineWidth);
  }, [duration, currentTime]);
  const [progbarInc, setProgbarInc] = useState(0);

  const seekbarOutline = useRef();
  const volumebarOutline = useRef();
  const volumeslider = useRef();

  const handleVolume = (e) => {
    if (e.buttons !== 1) return;

    const outlineRect = volumebarOutline.current.getBoundingClientRect();
    const outlineWidth = Math.round(outlineRect.width);
    const widthRange = e.clientX - volumebarOutline.current.offsetLeft;

    if (widthRange > 0 || widthRange < outlineWidth) {
      const mark = widthRange / outlineWidth;
      audioRef.current.volume = Math.round(mark * 10) / 10;

      volumeslider.current.setAttribute('style', `width:${widthRange}px`);
    } else {
      return;
    }
  };

  const handleSeekTime = (e) => {
    if (e.buttons !== 1) console.log(e.buttons !== 1);
    const totaltime = convertDurationSeconds(duration);
    /* const seekbar = document.querySelector('.seekbar'); */
    const seekbarOutlineWidth = seekbarOutline.current.clientWidth;
    const seekPoint = e.clientX - seekbarOutline.current.getBoundingClientRect().left;

    audioRef.current.currentTime = (totaltime / seekbarOutlineWidth) * seekPoint;
  };

  return (
    <div className={!library ? 'audio-player centered' : 'audio-player'}>
      <div className="title">{title ? <>{title.slice(0, 20)}</> : null}</div>

      {cover && cover !== 'not available' && (
        <>
          <div className="image">
            <img src={cover} alt="" />
          </div>
        </>
      )}
      {cover === 'not available' && delay === true && <p>No available image</p>}

      <div className="metadata">
        <>
          {artist ? (
            <div>
              <span className="label">Artist: </span>
              <span className="real-time">{artist.slice(0, 25)}</span>
            </div>
          ) : null}
          {album ? (
            <div>
              <span className="label">Album: </span>
              <span className="real-time">{album.slice(0, 25)}</span>
            </div>
          ) : null}
        </>
      </div>
      {/* <div style={{ color: 'white' }}>{audioRef.current.volume * 10}</div> */}
      <div className="volume-outline" onMouseMove={handleVolume} ref={volumebarOutline}>
        <div className="volumebar" ref={volumeslider}></div>
      </div>
      <div className="time">
        <span className="label">Duration: </span>
        <span className="real-time">{duration}</span>
        <span className="label">Elapsed: </span>
        <span className="real-time">{currentTime}</span>
      </div>

      <div className="seekbar-outline" ref={seekbarOutline} onClick={handleSeekTime}>
        <div className="seekbar" style={{ width: progbarInc ? `${progbarInc}px` : null }}></div>
      </div>
      <ul className="controls">
        <li className="btn" id="like" onClick={onClick}>
          <FaHeart id="like" className="icon" />
        </li>

        {pause ? (
          <li className="btn" id="pauseplay" onClick={onClick}>
            <GiPlayButton id="pauseplay" className="icon" />
          </li>
        ) : (
          <li className="btn" id="pauseplay" onClick={onClick}>
            <GiPauseButton id="pauseplay" className="icon" />
          </li>
        )}
        <li className="btn" id="backward" onClick={onClick}>
          <FaBackward id="backward" className="icon" />
        </li>

        <li className="btn" id="forward" onClick={onClick}>
          <FaForward id="forward" className="icon" />
        </li>
        <li className="btn" id="playlist" onClick={onClick}>
          <FaListUl id="playlist" className="icon" />
        </li>
      </ul>
    </div>
  );
};

export default Player;
