import { useEffect, useState, useRef, useReducer, useContext, createContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GiPauseButton, GiPlayButton } from 'react-icons/gi';
import { FaForward, FaBackward, FaListUl, FaHeart } from 'react-icons/fa';
import { GiMagnifyingGlass } from 'react-icons/gi';
import { ArchiveAdd, Playlist, Shuffle, Plus, Minus } from './assets/icons';
import { Buffer } from 'buffer';
/* import TrackSelector from './hooks/TrackSelector'; */
/* import AppState from './hooks/AppState'; */
import { useAudioPlayer } from './AudioPlayerContext';

/* import useAudio from './hooks/useAudio'; */

import {
  convertDuration,
  convertDurationSeconds,
  convertCurrentTime,
  convertToSeconds
} from './hooks/useTime';
import Player from './components/Player';
import InfiniteList from './Components/InfiniteList';
import Switch from './Components/Switch';
import Home from './Components/Home';
import Update from './Components/Update';
import MainNav from './Components/MainNav';
import Controls from './Components/Controls';
import Extras from './Components/Extras';

import './App.css';

function App() {
  const { state, dispatch } = useAudioPlayer();

  useEffect(() => {
    const audio = state.audioRef.current;

    const handleLoadedMetadata = (e) => {
      /* console.log('onloadedmetadata: ', e); */
      audio.play();
      dispatch({ type: 'duration', duration: convertDuration(audio) });
      dispatch({ type: 'set-delay', delay: true });
    };

    const handleError = (e) => {
      const { code, message } = e.target.error; // Note: Adjusted for potential cross-browser compatibility
      console.log(code, message);
    };

    const handleSeeking = () => {
      dispatch({ type: 'seeking', seeking: true });
      setTimeout(() => dispatch({ type: 'seeking', seeking: false }), 2000);
    };

    const handleVolumeChange = () => {
      dispatch({ type: 'set-volume', volume: audio.volume });
    };

    const handleEnded = () => {
      dispatch({ type: 'direction', playNext: true });
      dispatch({ type: 'set-delay', delay: false });
    };

    audio.onloadedmetadata = handleLoadedMetadata;
    audio.onerror = handleError;
    audio.onseeking = handleSeeking;
    audio.onvolumechange = handleVolumeChange;
    audio.onended = handleEnded;

    return () => {
      audio.onloadedmetadata = null;
      audio.onerror = null;
      audio.onseeking = null;
      audio.onvolumechange = null;
      audio.onended = null;
    };
  }, [state.audioRef]);

  useEffect(() => {
    if (state.pause) state.audioRef.current.pause();
    if (!state.pause) state.audioRef.current.play();
  }, [state.pause, state.audioRef.current]);

  /*   useEffect(() => {
    const changeMode = async () => {
      await window.api.screenMode('mini');
    };
    const changeDefault = async () => {
      await window.api.screenMode('default');
    };
    const changeExpandMini = async () => {
      await window.api.screenMode('mini-expanded');
    };
    if (state.minimalmode && state.player) changeMode();
    if (state.player && state.minimalmode && state.miniModePlaylist) changeExpandMini();
    if (!state.minimalmode && state.player) changeDefault();
  }, [state.minimalmode, state.player, state.miniModePlaylist]); */

  useEffect(() => {
    const changeScreenMode = async () => {
      if (state.minimalmode && state.player) {
        await window.api.screenMode(state.miniModePlaylist ? 'mini-expanded' : 'mini');
      } else if (!state.minimalmode && state.player) {
        await window.api.screenMode('default');
      }
    };
    changeScreenMode();
  }, [state.minimalmode, state.player, state.miniModePlaylist]);

  const handleUpdateLike = async (id) => {
    if (!id) return;
    const updatelike = await window.api.updateLike(id);
    console.log('update like: ', updatelike);
  };

  const handlePlayerControls = (e) => {
    console.log('handle player: ', e.currentTarget.id);
    switch (e.currentTarget.id) {
      case 'playlist':
        dispatch({
          type: 'library'
        });
        break;
      case 'pauseplay':
        dispatch({
          type: 'pauseplay'
        });
        break;
      case 'backward':
        dispatch({
          type: 'direction',
          playNext: false,
          playPrev: true
        });
        break;
      case 'forward':
        dispatch({
          type: 'direction',
          playPrev: false,
          playNext: true
        });
        break;
      case 'like':
        handleUpdateLike(state.active);
        break;
      case 'shuffle':
        if (state.listType === 'files') {
          dispatch({
            type: 'tracks-shuffle',
            tracksShuffle: !state.tracksShuffle
          });
          dispatch({
            type: 'tracks-pagenumber',
            tracksPageNumber: 0
          });
        }
        if (state.listType === 'playlist') {
          dispatch({
            type: 'playlist-shuffle',
            playlistShuffle: !state.playlistShuffle
          });
        }

        break;
      case 'miniplayer':
        if (state.miniModePlaylist) {
          return dispatch({
            type: 'exit-mini-to-full',
            miniModePlaylist: !state.miniModePlaylist,
            minimalmode: !state.minimalmode
          });
        }
        if (state.library && !state.minimalmode) {
          return dispatch({
            type: 'enter-mini-from-fullplaylist',
            miniModePlaylist: (state.miniModePlaylist = true),
            minimalmode: (state.minimalmode = true)
          });
        }

        dispatch({
          type: 'player-minimode',
          minimalmode: !state.minimalmode,
          home: false,
          update: false,
          player: true
        });
        break;
      default:
        return;
    }
  };

  /*   useEffect(() => {
    if (state.playlistTracks[0]) {
      TrackSelector(state.playlistTracks[0], state, dispatch);
    }
  }, [state.playlistTracks[0]]); */

  const handleMainNav = async (e) => {
    switch (e.currentTarget.id) {
      case 'close':
        /* window.api.appClose(); */
        break;
      case 'minimize':
        window.api.appMinimize();
        break;
      case 'maximize':
        /* if (minimalmode) {
          await window.api.screenMode('default');
        } */
        dispatch({
          type: 'set-maximize',
          maximized: !state.maximized
        });
        window.api.appMaximize();
        break;
      case 'minimodeinfo':
        dispatch({
          type: 'mini-mode-info',
          minimalmodeInfo: !state.minimalmodeInfo
        });
        break;
      case 'home':
        dispatch({
          type: 'set-page',
          home: true,
          update: false,
          player: false,
          library: false
        });
        break;
      case 'update':
        dispatch({
          type: 'set-page',
          home: false,
          update: true,
          player: false,
          library: false
        });
        break;
      case 'player':
        dispatch({
          type: 'set-page',
          home: false,
          update: false,
          player: true
        });
        break;
      case 'playerplaylist':
        dispatch({
          type: 'set-page',
          home: false,
          update: false,
          player: true,
          library: true
        });
        break;
      case 'mini-mode':
        if (state.miniModePlaylist) {
          return dispatch({
            type: 'exit-mini-to-full',
            miniModePlaylist: !state.miniModePlaylist,
            minimalmode: !state.minimalmode
          });
        }
        if (state.library && !state.minimalmode) {
          return dispatch({
            type: 'enter-mini-from-fullplaylist',
            miniModePlaylist: (state.miniModePlaylist = true),
            minimalmode: (state.minimalmode = true)
          });
        }

        dispatch({
          type: 'player-minimode',
          minimalmode: !state.minimalmode,
          home: false,
          update: false,
          player: true
        });

        break;
      case 'mini-mode-playlist':
        dispatch({
          type: 'mini-mode-playlist',
          miniModePlaylist: !state.miniModePlaylist,
          library: !state.library
        });
        break;
      default:
        return;
    }
  };

  const containerClassNames = () => {
    if (state.home) {
      return 'container container-home';
    }
    if (state.update) {
      return 'container container-update';
    }
    if (state.miniModePlaylist) {
      return 'container container-mini-expanded';
    }
    if (state.minimalmode && state.player) {
      return 'container container-minimal';
    }
    if (state.maximized) {
      return 'container container-maximized';
    }

    if (state.player || state.minimalmode) {
      return 'container container-player';
    }
    /*  if (!state.minimalmode) {
      return 'container';
    } */
  };

  return (
    <div className={containerClassNames()}>
      {state.home || state.update || state.library || state.minimalmode ? (
        <MainNav
          onClick={handleMainNav}
          home={state.home}
          update={state.update}
          player={state.player}
          minimalmode={state.minimalmode}
          library={state.library}
        />
      ) : null}
      {state.home && !state.minimalmode && <Home state={state} dispatch={dispatch} />}
      {state.update && <Update />}
      {state.player || state.home ? (
        <Player
          title={state.title}
          cover={state.cover}
          delay={state.delay}
          artist={state.artist}
          album={state.album}
          duration={state.duration}
          /* currentTime={state.currentTime} */
          pause={state.pause}
          onClick={handlePlayerControls}
          audioRef={state.audioRef}
          library={state.library}
          isLiked={state.isLiked}
          minimalmode={state.minimalmode}
          home={state.home}
          minimalmodeInfo={state.minimalmodeInfo}
          maximized={state.maximized}
          audio={state.audioRef.current.src}
        >
          {!state.minimalmode && (
            <>
              <Controls
                isLiked={state.isLiked}
                handlePlayerControls={handlePlayerControls}
                pause={state.pause}
                minimalmode={state.minimalmode}
                player={state.player}
                home={state.home}
                tracksShuffle={state.tracksShuffle}
                playlistShuffle={state.playlistShuffle}
                library={state.library}
                listType={state.listType}
              />
              {!state.home && (
                <Extras
                  handlePlayerControls={handlePlayerControls}
                  volume={state.volume}
                  seeking={state.seeking}
                  library={state.library}
                  tracksShuffle={state.tracksShuffle}
                  playlistShuffle={state.playlistShuffle}
                  home={state.home}
                />
              )}
            </>
          )}
        </Player>
      ) : null}
      {state.minimalmode && (
        <Controls
          isLiked={state.isLiked}
          handlePlayerControls={handlePlayerControls}
          pause={state.pause}
          minimalmode={state.minimalmode}
          player={state.player}
          home={state.home}
          tracksShuffle={state.tracksShuffle}
          playlistShuffle={state.playlistShuffle}
          listType={state.listType}
        />
      )}

      {state.player || state.miniModePlaylist || state.home || state.update ? (
        <InfiniteList
        /* handleTrackSelection={TrackSelector} */
        /* library={state.library} */
        /* currentTrack={state.newtrack} */
        /* playNext={state.playNext}
          playPrev={state.playPrev}
          nextTrack={state.nextTrack}
          prevTrack={state.prevTrack}
          active={state.active} */
        /*  dispatch={dispatch}
          state={state} */
        /* listType={state.listType} */
        /* handlePicture={handlePicture} */
        /* tracks={state.tracks} */
        /*  tracksPageNumber={state.tracksPageNumber} */
        /* tracksShuffle={state.tracksShuffle} */
        /* playlistShuffle={state.playlistShuffle} */
        /* playlistTracks={state.playlistTracks} */
        /*  minimalmode={state.minimalmode}
          miniModePlaylist={state.miniModePlaylist}
          albums={state.albums}
          albumsPageNumber={state.albumsPageNumber} */
        />
      ) : null}
      {/*       ) : null} */}
    </div>
  );
}

export default App;

/*
 const handleReq = async () => {
    const albums = await window.api.updateFolders();
    console.log(albums);
  };
*/
