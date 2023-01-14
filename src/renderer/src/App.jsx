import { useEffect, useState, useRef, useReducer } from 'react';
import { GiPauseButton, GiPlayButton } from 'react-icons/gi';
import { FaForward, FaBackward, FaListUl, FaHeart } from 'react-icons/fa';
import { GiMagnifyingGlass } from 'react-icons/gi';
import { ArchiveAdd, Playlist, Shuffle, Plus, Minus } from './assets/icons';
import { Buffer } from 'buffer';
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

import './App.css';

function App() {
  const audioPlayer = {
    home: true,
    update: false,
    player: false,
    library: false,
    minimalmode: false,
    active: '',
    newtrack: '',
    playNext: false,
    playPrev: false,
    nextTrack: '',
    prevTrack: '',
    artist: '',
    title: '',
    album: '',
    cover: '',
    duration: '',
    currentTime: '',
    pause: false,
    progbarInc: 0,
    currentVolume: 1.0,
    filesPageNumber: 0,
    albumsPageNumber: 0,
    type: 'files',
    searchTermFiles: '',
    searchTermAlbums: '',
    randomize: false,
    albumPath: '',
    showMore: null,
    delay: false
  };

  const reducer = (state, action) => {
    switch (action.type) {
      case 'library': {
        return { ...state, library: !state.library };
      }
      case 'pauseplay': {
        return { ...state, pause: !state.pause };
      }
      case 'direction': {
        return {
          ...state,
          playNext: action.playNext,
          playPrev: action.playPrev
        };
      }
      case 'newtrack': {
        return {
          ...state,
          pause: action.pause,
          newtrack: action.newtrack,
          artist: action.artist,
          title: action.title,
          album: action.album,
          cover: action.cover,
          active: action.active,
          nextTrack: action.nextTrack,
          prevTrack: action.prevTrack
        };
      }
      case 'duration': {
        return {
          ...state,
          duration: action.duration
        };
      }

      case 'current-time': {
        return {
          ...state,
          currentTime: action.currentTime
        };
      }
      case 'set-next-track': {
        return {
          ...state,
          nextTrack: action.nextTrack
        };
      }

      case 'set-prev-track': {
        return {
          ...state,
          prevTrack: action.prevTrack
        };
      }
      case 'set-cover': {
        return {
          ...state,
          cover: action.cover
        };
      }

      case 'set-delay': {
        return {
          ...state,
          delay: action.delay
        };
      }

      case 'set-page': {
        return {
          ...state,
          home: action.home,
          update: action.update,
          player: action.player,
          library: action.library
        };
      }
      case 'player-minimode': {
        return {
          ...state,
          minimalmode: action.minimalmode
        };
      }
      default:
        return;
    }
  };

  const [state, dispatch] = useReducer(reducer, audioPlayer);

  const audio = new Audio();
  const audioRef = useRef(audio);
  const [type, setType] = useState('files');

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
      default:
        return;
    }
  };

  useEffect(() => {
    audioRef.current.onloadedmetadata = async () => {
      audioRef.current.play();
      dispatch({
        type: 'duration',
        duration: convertDuration(audioRef.current)
      });
      dispatch({
        type: 'set-delay',
        delay: true
      });
    };
  });

  useEffect(() => {
    audioRef.current.ontimeupdate = () => {
      dispatch({
        type: 'current-time',
        currentTime: convertCurrentTime(audioRef.current)
      });
    };
  }, [audioRef]);

  useEffect(() => {
    audioRef.current.onended = () => {
      dispatch({
        type: 'direction',
        playNext: true
      });
      dispatch({
        type: 'set-delay',
        delay: false
      });
    };
  }, [audioRef]);

  useEffect(() => {
    if (state.pause) audioRef.current.pause();
    if (!state.pause) audioRef.current.play();
  }, [state.pause, audioRef]);

  const handlePicture = (buffer) => {
    const bufferToString = Buffer.from(buffer).toString('base64');
    return `data:${buffer.format};base64,${bufferToString}`;
  };

  const handleTrackSelection = async (e, artist, title, album, audiofile) => {
    e.preventDefault();
    /*  console.log(artist, title, album, audiofile); */
    dispatch({
      type: 'newtrack',
      pause: false,
      newtrack: +e.target.getAttribute('val'),
      artist,
      title,
      album,
      active: e.target.id,
      nextTrack: '',
      prevTrack: ''
    });

    dispatch({
      type: 'direction',
      playNext: false,
      playPrev: false
    });

    /* const filebuffer = await window.api.streamAudio(e.target.id); */
    const filebuffer = await window.api.streamAudio(audiofile);

    const blob = new Blob([filebuffer], { type: 'audio/wav' });
    const url = window.URL.createObjectURL(blob);

    audioRef.current.src = url;

    const picture = await window.api.getCover(e.target.id);
    if (picture === 0) {
      dispatch({
        type: 'set-cover',
        cover: 'not available'
      });
    } else {
      dispatch({
        type: 'set-cover',
        cover: handlePicture(picture)
      });
    }

    audioRef.current.load();
  };

  const handleMinimalMode = async () => {
    state.minimalmode
      ? await window.api.screenMode('mini')
      : await window.api.screenMode('default');
  };

  useEffect(() => {
    const changeMode = async () => {
      await window.api.screenMode('mini');
    };
    const changeDefault = async () => {
      await window.api.screenMode('default');
    };
    if (state.minimalmode && state.player) changeMode();
    if (!state.minimalmode && state.player) changeDefault();
  }, [state.minimalmode, state.player]);

  const handleMainNav = (e) => {
    switch (e.currentTarget.id) {
      case 'close':
        window.api.appClose();
        break;
      case 'minimize':
        window.api.appMinimize();
        break;
      case 'maximize':
        window.api.appMaximize();
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
        dispatch({
          type: 'player-minimode',
          minimalmode: !state.minimalmode
        });
        /* handleMinimalMode(); */
        break;
      default:
        return;
    }
  };

  return (
    <div className={state.minimalmode && state.player ? 'container minimal' : 'container'}>
      <MainNav
        onClick={handleMainNav}
        home={state.home}
        update={state.update}
        player={state.player}
      />
      {state.home && <Home />}
      {state.update && <Update />}
      {state.player ? (
        <Player
          title={state.title}
          cover={state.cover}
          delay={state.delay}
          artist={state.artist}
          album={state.album}
          duration={state.duration}
          currentTime={state.currentTime}
          pause={state.pause}
          onClick={handlePlayerControls}
          audioRef={audioRef}
          library={state.library}
        />
      ) : null}
      {state.library ? (
        <InfiniteList
          handleTrackSelection={handleTrackSelection}
          library={state.library}
          currentTrack={state.newtrack}
          playNext={state.playNext}
          playPrev={state.playPrev}
          nextTrack={state.nextTrack}
          prevTrack={state.prevTrack}
          active={state.active}
          dispatch={dispatch}
          handlePicture={handlePicture}
        />
      ) : null}
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
