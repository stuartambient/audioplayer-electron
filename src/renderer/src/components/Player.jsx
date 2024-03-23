import { useState, useRef, useEffect } from 'react';
import { useAudioPlayer } from '../AudioPlayerContext';
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
import '../style/Player.css';

const Player = ({ onClick, children }) => {
  const { state, dispatch } = useAudioPlayer();
  const [cTime, setCTime] = useState('00:00');
  const [progbarInc, setProgbarInc] = useState(0);

  useEffect(() => {
    const outlineWidth = seekbarOutline.current.clientWidth;
    const convertForProgbar = convertToSeconds(state.duration, cTime);
    setProgbarInc(convertForProgbar * outlineWidth);
  }, [state.duration, cTime]);

  useEffect(() => {
    state.audioRef.current.ontimeupdate = () => {
      setCTime(convertCurrentTime(state.audioRef.current));
    };
  }, [state.audioRef]);

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
      state.audioRef.current.volume = Math.round(mark * 10) / 10;

      volumeslider.current.setAttribute('style', `width:${widthRange}px`);
    } else {
      return;
    }
  };

  const handleSeekTime = (e) => {
    const totaltime = convertDurationSeconds(state.duration);
    /* const seekbar = document.querySelector('.seekbar'); */
    const seekbarOutlineWidth = seekbarOutline.current.clientWidth;
    const seekPoint = e.clientX - seekbarOutline.current.getBoundingClientRect().left;

    state.audioRef.current.currentTime = (totaltime / seekbarOutlineWidth) * seekPoint;
    /* setCTime(totaltime / seekbarOutlineWidth) * seekPoint; */
  };

  const playerClassNames = () => {
    if (!state.library && !state.minimalmode && !state.home) {
      return 'audio-player centered';
    }

    if (state.maximized && !state.home) {
      return 'audio-player audio-player--maximized';
    }
    if (state.home) {
      return 'audio-player--homepage';
    }
    if (state.library && !state.minimalmode) {
      return 'audio-player';
    }
    if (!state.library && state.minimalmode) {
      return 'audio-player minimal-player';
    }
    if (state.minimalmode) {
      return 'audio-player minimal-player';
    }
    if (state.library && state.minimalmode) {
      return 'audio-player minimal-player--expanded';
    }
  };

  return (
    <div
      className={playerClassNames()}
      style={
        state.minimalmode ? { backgroundImage: `url(${state.cover})` } : { backgroundImage: 'none' }
      }
    >
      {!state.minimalmodeInfo && !state.home && (
        <div className="title">
          <p
            className={
              state.title.length > 35 /* && !minimalmode */ ? 'title-transform' : 'title-text'
            }
          >
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

      {!state.minimalmodeInfo && !state.home && (
        <div className="metadata">
          <>
            {state.artist ? (
              <div className="metadata-artist">
                {!state.home && <span className="label">Artist: </span>}
                <span className="real-time">
                  <span
                    className={
                      state.artist.length > 35 /* && !minimalmode */
                        ? 'artist-transform'
                        : 'artist-text'
                    }
                  >
                    {state.artist}
                  </span>
                </span>
              </div>
            ) : null}
            {state.album ? (
              <div className="metadata-album">
                {!state.home && <span className="label">Album: </span>}
                <span className="real-time">
                  <span
                    className={
                      state.album.length > 25 /* && !minimalmode */
                        ? 'album-transform'
                        : 'album-text'
                    }
                  >
                    {state.album}
                  </span>
                </span>
              </div>
            ) : null}
          </>
        </div>
      )}

      {!state.minimalmodeInfo && state.home && (
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

      {!state.minimalmodeInfo && (
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
      {state.minimalmode && !state.minimalmodeInfo ? (
        <div className="slider-group">
          <>
            <div className="volume-outline" onMouseMove={handleVolume} ref={volumebarOutline}>
              <div className="volumebar" ref={volumeslider}></div>
            </div>
            <div
              className="seekbar-outline"
              /* id="waveform" */
              ref={seekbarOutline}
              onClick={handleSeekTime}
            >
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

          <div
            className="seekbar-outline"
            id="waveform"
            ref={seekbarOutline}
            onClick={handleSeekTime}
          >
            <div className="seekbar" style={{ width: progbarInc ? `${progbarInc}px` : null }}></div>
          </div>
        </>
      )}

      {children}
    </div>
  );
};

export default Player;
