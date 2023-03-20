import { useEffect, useState, useRef, useReducer, useContext, createContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GiPauseButton, GiPlayButton } from 'react-icons/gi';
import { FaForward, FaBackward, FaListUl, FaHeart } from 'react-icons/fa';
import { GiMagnifyingGlass } from 'react-icons/gi';
import { ArchiveAdd, Playlist, Shuffle, Plus, Minus } from './assets/icons';
import { Buffer } from 'buffer';
import TrackSelector from './hooks/TrackSelector';
import AppState from './hooks/AppState';

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
  const { state, dispatch } = AppState();

  /*  const audio = new Audio();
  const audioRef = useRef(audio); */
  /* const { audioRef } = useAudio(); */
  /*  const [type, setType] = useState('files'); */

  const handleUpdateLike = async (id) => {
    if (!id) return;
    const updatelike = await window.api.updateLike(id);
    console.log('update like: ', updatelike);
  };

  const handleShuffle = async () => {
    dispatch({
      type: 'shuffle',
      shuffle: !state.shuffle
    });
    dispatch({
      type: 'tracks-pagenumber',
      tracksPageNumber: 0
    });

    /*    dispatch({
      type: 'reset-tracks',
      tracks: []
    });
    dispatch({
      type: 'tracks-pagenumber',
      tracksPageNumber: 0
    }); */
  };

  /*   useEffect(() => {
    if (state.shuffle) {
      dispatch({
        type: 'reset-tracks',
        tracks: []
      });
    }
  }, [state.shuffle]); */

  /*   useEffect(() => {
    const setupShuffle = async () => {
      const totaltracks = await window.api.totalTracksStat();
      const refreshkey = uuidv4();
      const setRandArray = await window.api.setShuffledTracksArray(totaltracks, refreshkey);
      const shuffledTracks = await window.api.getShuffledTracks(0, 50);

      if (shuffledTracks && subscribed) {
        dispatch({
          type: 'add-shuffled-tracks',
          tracks: shuffledTracks
        });
      }
    };
    if (state.shuffle) setupShuffle();
  }, [state.shuffle]); */

  /*    } else {
      const allTracks = await window.api.getTracks(state.tracksPageNumber, '');
      dispatch({
        type: 'tracks-playlist',
        tracks: allTracks
      });
    }  */

  /*   const sendToMain = async () => {
    await window.api.sendState(state.active, state.currentTrack).then((r) => console.log(r));
  }; */
  const handlePlayerControls = (e) => {
    switch (e.currentTarget.id) {
      case 'playlist':
        /* if (state.minimalmode) return; */
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
        /* sendToMain(); */
        handleUpdateLike(state.active);
        break;
      case 'shuffle':
        /* window.api.getAllTracks(); */
        handleShuffle();

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

  useEffect(() => {
    state.audioRef.current.onloadedmetadata = async () => {
      state.audioRef.current.play();
      dispatch({
        type: 'duration',
        duration: convertDuration(state.audioRef.current)
      });
      dispatch({
        type: 'set-delay',
        delay: true
      });
    };
  });

  /*   useEffect(() => {
    state.audioRef.current.ontimeupdate = () => {
      dispatch({
        type: 'current-time',
        currentTime: convertCurrentTime(state.audioRef.current)
      });
    };
  }, [state.audioRef]); */

  useEffect(() => {
    state.audioRef.current.onseeking = () => {
      dispatch({
        type: 'seeking',
        seeking: true
      });
      setTimeout(() => dispatch({ type: 'seeking', seeking: false }), 2000);
    };
  }, [state.audioRef.onseeking]);

  useEffect(() => {
    state.audioRef.current.onvolumechange = () => {
      console.log('onvolumechange: ', state.audioRef.current.volume);
      dispatch({
        type: 'set-volume',
        volume: state.audioRef.current.volume
      });
    };
  });

  useEffect(() => {
    state.audioRef.current.onended = () => {
      dispatch({
        type: 'direction',
        playNext: true
      });
      dispatch({
        type: 'set-delay',
        delay: false
      });
    };
  }, [state.audioRef]);

  useEffect(() => {
    if (state.pause) state.audioRef.current.pause();
    if (!state.pause) state.audioRef.current.play();
  }, [state.pause, state.audioRef.current]);

  useEffect(() => {
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
  }, [state.minimalmode, state.player, state.miniModePlaylist]);

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
                shuffle={state.shuffle}
                library={state.library}
              />
              {!state.home && (
                <Extras
                  handlePlayerControls={handlePlayerControls}
                  volume={state.volume}
                  seeking={state.seeking}
                  library={state.library}
                  shuffle={state.shuffle}
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
          shuffle={state.shuffle}
        />
      )}

      {state.player || state.miniModePlaylist || state.home || state.update ? (
        <InfiniteList
          handleTrackSelection={TrackSelector}
          library={state.library}
          currentTrack={state.newtrack}
          playNext={state.playNext}
          playPrev={state.playPrev}
          nextTrack={state.nextTrack}
          prevTrack={state.prevTrack}
          active={state.active}
          dispatch={dispatch}
          state={state}
          listType={state.listType}
          /* handlePicture={handlePicture} */
          tracks={state.tracks}
          tracksPageNumber={state.tracksPageNumber}
          shuffle={state.shuffle}
          playlistTracks={state.playlistTracks}
          minimalmode={state.minimalmode}
          miniModePlaylist={state.miniModePlaylist}
          albums={state.albums}
          albumsPageNumber={state.albumsPageNumber}
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
