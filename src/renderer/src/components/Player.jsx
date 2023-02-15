import { useState, useRef, useEffect } from 'react';

import {
  convertDuration,
  convertDurationSeconds,
  convertCurrentTime,
  convertToSeconds
} from '../hooks/useTime';
import { FaHeart, FaBackward, FaForward, FaListUl } from 'react-icons/fa';
import { GiPauseButton, GiPlayButton } from 'react-icons/gi';
import { FiVolume } from 'react-icons/fi';
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
  library,
  active,
  isLiked,
  minimalmode,
  home
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

  const playerClassNames = () => {
    if (!library && !minimalmode && !home) {
      return 'audio-player centered';
    }
    if (home) {
      return 'audio-player--homepage';
    }
    if (library && !minimalmode) {
      return 'audio-player';
    }
    if (!library && minimalmode) {
      return 'audio-player minimal-player';
    }
    if (library && minimalmode) {
      return 'audio-player minimal-player--expanded';
    }
  };

  return (
    <div className={playerClassNames()}>
      <div className={title.length > 35 ? 'title transform' : 'title'}>
        {title ? <>{title /* .slice(0, 20) */}</> : null}
      </div>

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
            <div className="metadata-artist">
              {!home && <span className="label">Artist: </span>}
              <span className="real-time">{artist.slice(0, 25)}</span>
            </div>
          ) : null}
          {album ? (
            <div className="metadata-album">
              {!home && <span className="label">Album: </span>}
              <span className="real-time">{album.slice(0, 25)}</span>
            </div>
          ) : null}
        </>
      </div>

      <div className="time">
        <div className="duration">
          {!home && <span className="label">Duration: </span>}
          <span className="real-time">{duration}</span>
        </div>
        <div className="elapsed">
          {!home && <span className="label">Elapsed: </span>}
          <span className="real-time">{currentTime}</span>
        </div>
      </div>
      {minimalmode ? (
        <div className="slider-group">
          <>
            <div className="volume-outline" onMouseMove={handleVolume} ref={volumebarOutline}>
              <div className="volumebar" ref={volumeslider}></div>
            </div>
            <div className="seekbar-outline" ref={seekbarOutline} onClick={handleSeekTime}>
              <div
                className="seekbar"
                style={{ width: progbarInc ? `${progbarInc}px` : null }}
              ></div>
            </div>
          </>
        </div>
      ) : (
        <>
          <div className="volume-outline" onMouseMove={handleVolume} ref={volumebarOutline}>
            <div className="volumebar" ref={volumeslider}></div>
          </div>
          <div className="seekbar-outline" ref={seekbarOutline} onClick={handleSeekTime}>
            <div className="seekbar" style={{ width: progbarInc ? `${progbarInc}px` : null }}></div>
          </div>
        </>
      )}

      <ul className="controls">
        <li className={isLiked ? 'btn isliked' : 'btn'} id="like" onClick={onClick}>
          <FaHeart />
        </li>

        {pause ? (
          <li className="btn" id="pauseplay" onClick={onClick}>
            <GiPlayButton />
          </li>
        ) : (
          <li className="btn" id="pauseplay" onClick={onClick}>
            <GiPauseButton />
          </li>
        )}
        <li className="btn" id="backward" onClick={onClick}>
          <FaBackward />
        </li>

        <li className="btn" id="forward" onClick={onClick}>
          <FaForward />
        </li>
        {!minimalmode && (
          <li className="btn" id="playlist" onClick={onClick}>
            <FaListUl />
          </li>
        )}
      </ul>
    </div>
  );
};

export default Player;
