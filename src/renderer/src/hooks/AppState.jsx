import { useReducer, useRef } from 'react';

const AppState = () => {
  const audioPlayer = {
    audioRef: useRef(new Audio()),
    home: true,
    update: false,
    player: false,
    library: false,
    minimalmode: false,
    miniModePlaylist: false,
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
    /* filesPageNumber: 0, */
    albumsPageNumber: 0,
    type: 'files',
    searchTermFiles: '',
    searchTermAlbums: '',
    randomize: false,
    albumPath: '',
    showMore: null,
    delay: false,
    isLiked: false,
    tracks: [],
    tracksPageNumber: 0
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
          prevTrack: action.prevTrack,
          isLiked: action.isLiked
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
      case 'tracks-playlist': {
        return {
          ...state,
          /*  tracks: action.tracks */
          tracks: [...state.tracks, ...action.tracks]
        };
      }
      case 'reset-tracks': {
        return {
          ...state,
          tracks: action.tracks
        };
      }
      case 'tracks-pagenumber': {
        return {
          ...state,
          tracksPageNumber: action.tracksPageNumber
        };
      }
      case 'mini-mode-playlist': {
        return {
          ...state,
          miniModePlaylist: action.miniModePlaylist,
          library: action.library
        };
      }
      default:
        return;
    }
  };

  const [state, dispatch] = useReducer(reducer, audioPlayer);
  return { state, dispatch };
};

export default AppState;
