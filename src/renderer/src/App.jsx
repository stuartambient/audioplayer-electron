import { useEffect, useState, useRef, useReducer, useContext, createContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import classNames from 'classnames';
import { GiPauseButton, GiPlayButton } from 'react-icons/gi';
import { FaForward, FaBackward, FaListUl, FaHeart } from 'react-icons/fa';
import { GiMagnifyingGlass } from 'react-icons/gi';
import { ArchiveAdd, Playlist, Shuffle, Plus, Minus } from './assets/icons';
import { Buffer } from 'buffer';
import { useAudioPlayer } from './AudioPlayerContext';

import {
  convertDuration,
  convertDurationSeconds,
  convertCurrentTime,
  convertToSeconds
} from './hooks/useTime';
import Player from './components/Player';
import InfiniteList from './Components/InfiniteList';
/* import Switch from './Components/Switch'; */
import Home from './Components/Home';
import Update from './Components/Update';
import MainNav from './Components/MainNav';
import Controls from './Components/Controls';
import Extras from './Components/Extras';
import Stats from './Components/Stats';

import './App.css';
/* import './style/normalize.css'; */

function App() {
  const { state, dispatch } = useAudioPlayer();

  /*   const stateItemsToRemove = ['albums', 'tracks', 'covers', 'audioRef'];

  function cloneAndRemoveProps(obj, propsToRemove) {
    const clonedObj = JSON.parse(JSON.stringify(obj));
    stateItemsToRemove.forEach((prop) => {
      delete clonedObj[prop];
    });

    return clonedObj;
  }

  useEffect(() => {
    const refreshState = async () => {
      await window.api.saveState(JSON.parse(JSON.stringify(state)));
    };
    refreshState();
  }, [state]); */

  useEffect(() => {
    const audio = state.audioRef.current;

    const handleLoadedMetadata = (e) => {
      /* console.log('onloadedmetadata: ', e); */
      /* audio.play(); */
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

  useEffect(() => {
    let subscribed = true;
    const changeScreenMode = async () => {
      if (state.minimalmode && state.player) {
        await window.api.screenMode(state.miniModePlaylist ? 'mini-expanded' : 'mini');
        await window.api.toggleResizable(false);
      } else if (!state.minimalmode && state.player && state.library) {
        await window.api.screenMode('player-library');
        await window.api.toggleResizable(true);
      } else if (state.player && !state.library) {
        await window.api.screenMode('player');
        await window.api.toggleResizable(false);
      } else if (!state.player) {
        await window.api.screenMode('default');
        await window.api.toggleResizable(true);
      }
    };
    if (subscribed) {
      changeScreenMode();
    }
    return () => (subscribed = false);
  }, [state.minimalmode, state.player, state.miniModePlaylist, state.library]);

  const handleUpdateLike = async (id) => {
    if (!id) return;
    const updatelike = await window.api.updateLike(id);
    console.log('update like: ', updatelike);
  };

  const handlePlayerControls = (e) => {
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
    console.log('handleMainNav: ', e.currentTarget.id);
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
        /* dispatch({
          type: 'set-maximize',
          maximized: !state.maximized
        }); */
        window.api.appMaximize();
        break;
      case 'minimodeinfo':
        dispatch({
          type: 'mini-mode-info',
          minimalmodeInfo: !state.minimalmodeInfo
        });
        break;
      case 'albums':
        dispatch({
          type: 'set-page',
          home: true,
          update: false,
          player: false,
          library: false,
          tagEditor: false
        });
        break;
      case 'playlists':
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
          library: false,
          tagEditor: false
        });
        break;
      case 'player':
        dispatch({
          type: 'set-page',
          home: false,
          update: false,
          player: true,
          tagEditor: false
        });
        break;
      case 'tag-editor':
        dispatch({
          type: 'set-page',
          home: false,
          update: false,
          player: false,
          tagEditor: true
        });
        break;

      case 'playerplaylist':
        dispatch({
          type: 'set-page',
          home: false,
          update: false,
          player: true,
          library: true,
          tagEditor: false
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

  /*   const containerClassNames = () => {
    if (state.home) {
      return 'container container-home';
    }
    if (state.update) {
      return 'container container-update';
    }
    if (state.tagEditor) {
      return 'container container-home';
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
  }; */

  const containerClassNames = classNames('container', {
    'container-home': state.home || state.tagEditor,
    'container-update': state.update,
    'container-mini-expanded': state.miniModePlaylist,
    'container-minimal': state.minimalmode && state.player,
    'container-maximized': state.maximized,
    'container-player': state.player && !state.minimalmode && !state.miniModePlaylist
  });

  return (
    <div className={containerClassNames}>
      {state.home || state.update || state.library || state.minimalmode || state.tagEditor ? (
        <MainNav onClick={handleMainNav} />
      ) : null}
      {/* {state.home && !state.minimalmode && <Home />} */}
      <Home />
      {state.update && <Update />}
      {state.player || state.home ? (
        <Player onClick={handlePlayerControls}>
          {!state.minimalmode && (
            <>
              <Controls handlePlayerControls={handlePlayerControls} />
              {!state.home && <Extras handlePlayerControls={handlePlayerControls} />}
            </>
          )}
        </Player>
      ) : null}
      {state.tagEditor && <Stats />}
      {state.minimalmode && <Controls handlePlayerControls={handlePlayerControls} />}

      {state.player || state.miniModePlaylist || state.home || state.update ? (
        <InfiniteList />
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
