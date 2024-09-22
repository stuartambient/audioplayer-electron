import { useState, useRef, useEffect } from 'react';
import { useAudioPlayer } from '../AudioPlayerContext';
import classNames from 'classnames';
import { BsVolumeMute } from 'react-icons/bs';
import { BiVolumeFull } from 'react-icons/bi';
import {
  convertDuration,
  convertDurationSeconds,
  convertCurrentTime,
  convertToSeconds
} from '../hooks/useTime';
import { FaHeart, FaBackward, FaForward, FaListUl } from 'react-icons/fa';
import { GiJetPack, GiPauseButton, GiPlayButton } from 'react-icons/gi';
import { FiVolume } from 'react-icons/fi';
import PlayerScrubber from './PlayerScrubber';
import PlayerVolume from './PlayerVolume';
import '../style/Player.css';

const Player = ({ onClick, children }) => {
  const { state, dispatch } = useAudioPlayer();
  const [cTime, setCTime] = useState('00:00');
  /*   const [progbarInc, setProgbarInc] = useState(0);
  const [isDragging, setIsDragging] = useState(false); */

  /*   const seekbarOutline = useRef();
  const seekbar = useRef();
  const volumebarOutline = useRef();
  const volumeslider = useRef(); */

  /*   useEffect(() => {
    const outlineWidth = seekbarOutline.current.clientWidth;
    const convertForProgbar = convertToSeconds(state.duration, cTime);
    setProgbarInc(convertForProgbar * outlineWidth);
  }, [state.duration, cTime]); */

  /*   useEffect(() => {
    state.audioRef.current.ontimeupdate = () => {
      if (!isDragging) {
        setCTime(convertCurrentTime(state.audioRef.current));
      }
    };
  }, [state.audioRef, isDragging]); */

  useEffect(() => {
    if (state.minimalmodeInfo && !state.minimalmode) {
      dispatch({
        type: 'mini-mode-info',
        minimalmodeInfo: false
      });
    }
  }, [state.minimalmodeInfo, state.minimalmode]);

  /*   const handleMouseDown = (e) => {
    setIsDragging(true);
  }; */

  /*   const handleMouseMove = (e) => {
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
  }; */

  /*   const handleMouseUp = (e) => {
    if (isDragging) {
      handleSeekTime(e);
    }
    setIsDragging(false);
  }; */

  /*   const updateSliderWidth = (currentVolume) => {
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
  }, []); */

  /*   const handleSeekTime = (e) => {
    const totaltime = convertDurationSeconds(state.duration);
    const seekbarOutlineWidth = seekbarOutline.current.clientWidth;
    const seekPoint = e.clientX - seekbarOutline.current.getBoundingClientRect().left;

    state.audioRef.current.currentTime = (totaltime / seekbarOutlineWidth) * seekPoint;
  }; */

  const getPlayerClassNames = () => {
    return classNames('audio-player', {
      'audio-player--homepage': state.home,
      'minimal-player': state.minimalmode && !state.library,
      'minimal-player--expanded': state.library && state.minimalmode,
      centered: !state.library && !state.minimalmode && !state.home
    });
  };

  return (
    <div
      className={getPlayerClassNames()}
      style={
        state.minimalmode ? { backgroundImage: `url(${state.cover})` } : { backgroundImage: 'none' }
      }
    >
      {!state.minimalmode && !state.home && (
        <div className="title">
          <p className={state.title.length > 35 ? 'title-transform' : 'title-text'}>
            {state.title}
          </p>
        </div>
      )}

      {!state.minimalmodeInfo && state.home && (
        <div className="title">
          <span className="real-time">
            <span className={state.title.length > 50 ? 'title-transform' : 'title-text'}>
              {state.title}
            </span>
          </span>
        </div>
      )}

      {state.cover && state.cover !== 'not available' && (
        <>
          <div style={{ backgroundImage: `url` }} className="image">
            {!state.minimalmode && <img src={state.cover} alt="" />}
          </div>
        </>
      )}
      {state.cover === 'not available' && !state.home && state.delay === true && (
        <p style={{ gridRow: '2 / 3' }}>No available image</p>
      )}

      {!state.minimalmode && !state.home && (
        <div className="metadata">
          <>
            {state.artist ? (
              <div className="metadata-artist">
                {!state.home && <span className="label">Artist: </span>}
                <span className="real-time">
                  <span className={state.artist.length > 20 ? 'artist-transform' : 'artist-text'}>
                    {state.artist}
                  </span>
                </span>
              </div>
            ) : null}
            {state.album ? (
              <div className="metadata-album">
                {!state.home && <span className="label">Album: </span>}
                <span className="real-time">
                  <span className={state.album.length > 25 ? 'album-transform' : 'album-text'}>
                    {state.album}
                  </span>
                </span>
              </div>
            ) : null}
          </>
        </div>
      )}

      {!state.minimalmode && state.home && (
        <>
          {state.artist ? (
            <div className="metadata-artist">
              {!state.home && <span className="label">Artist: </span>}
              <span className="real-time">
                <span className={state.artist.length > 25 ? 'artist-transform' : 'artist-text'}>
                  {state.artist}
                </span>
              </span>
            </div>
          ) : null}
          {state.album ? (
            <div className="metadata-album">
              {!state.home && <span className="label">Album: </span>}
              <span className="real-time">
                <span className={state.album.length > 25 ? 'album-transform' : 'album-text'}>
                  {state.album}
                </span>
              </span>
            </div>
          ) : null}
        </>
      )}

      {!state.minimalmode && (
        <div className="time">
          <div className="duration">
            {!state.home && <span className="label">Duration: </span>}
            <span className="real-time">{state.duration}</span>
          </div>
          <div className="elapsed">
            {!state.home && <span className="label">Elapsed: </span>}
            <span className="real-time">{cTime}</span>
          </div>
        </div>
      )}
      {!state.minimalmode && (
        <>
          <PlayerVolume />
          <PlayerScrubber cTime={cTime} setCTime={setCTime} />
          {/*           <div className="volume-outline" onMouseMove={handleVolume} ref={volumebarOutline}>
            <div className="volumebar" ref={volumeslider}></div>
          </div>
          <div
            className="seekbar-outline"
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
          </div> */}
        </>
      )}
      {state.minimalmodeInfo && (
        <>
          {/*   <div className="volume-outline" onMouseMove={handleVolume} ref={volumebarOutline}>
            <div className="volumebar" ref={volumeslider}></div>
          </div> */}
          {/*           <div
            className="seekbar-outline"
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
          </div> */}
          {/*  <PlayerVolume />
          <PlayerScrubber cTime={cTime} setCTime={setCTime} /> */}
        </>
      )}

      {children}
    </div>
  );
};

export default Player;
