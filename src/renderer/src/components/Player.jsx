import { useState, useRef, useEffect } from 'react';
import { BsVolumeMute } from 'react-icons/bs';
import { BiVolumeFull } from 'react-icons/bi';
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
  maximized,
  audioRef,
  library,
  active,
  isLiked,
  minimalmode,
  minimalmodeInfo,
  home,
  children
}) => {
  useEffect(() => {
    const outlineWidth = seekbarOutline.current.clientWidth;
    const convertForProgbar = convertToSeconds(duration, currentTime);
    /* console.log(convertForProgbar * outlineWidth); */
    setProgbarInc(convertForProgbar * outlineWidth);
  }, [duration, currentTime]);
  const [progbarInc, setProgbarInc] = useState(0);

  /*   useEffect(() => {
    console.log('volume: ', audioRef.current.volume);
  }, [audioRef.current.volume]); */

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

  /*   useEffect(() => {
    console.log('lengths: ', title.length, artist.length, album.length);
  }, [title, artist, album]); */

  const playerClassNames = () => {
    if (!library && !minimalmode && !home) {
      return 'audio-player centered';
    }

    if (maximized && !home) {
      return 'audio-player audio-player--maximized';
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
    if (minimalmode) {
      return 'audio-player minimal-player';
    }
    if (library && minimalmode) {
      return 'audio-player minimal-player--expanded';
    }
  };

  return (
    <div
      className={playerClassNames()}
      style={minimalmode ? { backgroundImage: `url(${cover})` } : { backgroundImage: 'none' }}
    >
      {!minimalmodeInfo && (
        <div className="title">
          <p className={title.length > 35 /* && !minimalmode */ ? 'title-transform' : 'title-text'}>
            {title}
          </p>
        </div>
      )}

      {cover && cover !== 'not available' && (
        <>
          <div style={{ backgroundImage: `url` }} className="image">
            {!minimalmode && <img src={cover} alt="" />}
          </div>
        </>
      )}
      {cover === 'not available' && delay === true && (
        <p style={{ gridRow: '2 / 3' }}>No available image</p>
      )}

      {!minimalmodeInfo && (
        <div className="metadata">
          <>
            {artist ? (
              <div className="metadata-artist">
                {!home && <span className="label">Artist: </span>}
                <span className="real-time">
                  <span
                    className={
                      artist.length > 35 /* && !minimalmode */ ? 'artist-transform' : 'artist-text'
                    }
                  >
                    {artist}
                  </span>
                </span>
              </div>
            ) : null}
            {album ? (
              <div className="metadata-album">
                {!home && <span className="label">Album: </span>}
                <span className="real-time">
                  <span
                    className={
                      album.length > 25 /* && !minimalmode */ ? 'album-transform' : 'album-text'
                    }
                  >
                    {album}
                  </span>
                </span>
              </div>
            ) : null}
          </>
        </div>
      )}

      {!minimalmodeInfo && (
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
      )}
      {minimalmode && !minimalmodeInfo ? (
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

      {/* <ul className="controls">
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
      </ul> */}
      {children}
    </div>
  );
};

export default Player;
