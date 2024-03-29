import React, { createContext, useReducer, useContext, useRef } from 'react';
/* this should appear in refactor/useContext only */
// Context creation
const AudioPlayerContext = createContext();

// Reducer function to manage state updates
const audioPlayerReducer = (state, action) => {
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
        newtrack: +action.newtrack,
        artist: action.artist,
        title: action.title,
        album: action.album,
        cover: action.cover,
        active: action.active,
        nextTrack: action.nextTrack,
        prevTrack: action.prevTrack,
        isLiked: action.isLiked,
        selectedTrackListType: action.selectedTrackListType
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

    case 'set-volume': {
      return {
        ...state,
        volume: action.volume
      };
    }
    case 'player-minimode': {
      return {
        ...state,
        minimalmode: action.minimalmode,
        home: action.home,
        update: action.update,
        player: action.player
      };
    }

    case 'tracks-playlist': {
      return {
        ...state,
        /*  tracks: action.tracks */
        tracks: [...state.tracks, ...action.tracks]
      };
    }

    case 'add-shuffled-tracks': {
      return {
        ...state,
        tracks: action.tracks
      };
    }

    case 'slice-prev-tracks': {
      return {
        ...state,
        tracks: action.tracks
      };
    }

    case 'current-playlist': {
      return {
        ...state,
        /*  tracks: action.tracks */
        playlistTracks: [...state.playlistTracks, ...action.playlistTracks]
      };
    }

    /*     case 'current-playlist-length': {
      return {
        ...state,
        playlistLength: state.playlistTracks.length
      };
    } */

    case 'albums-playlist': {
      return {
        ...state,
        /*  tracks: action.tracks */
        albums: [...state.albums, ...action.albums]
      };
    }
    case 'reset-tracks': {
      return {
        ...state,
        tracks: action.tracks
      };
    }

    case 'reset-albums': {
      return {
        ...state,
        albums: action.albums
      };
    }
    case 'tracks-pagenumber': {
      return {
        ...state,
        tracksPageNumber: action.tracksPageNumber
      };
    }
    case 'albums-pagenumber': {
      return {
        ...state,
        albumsPageNumber: action.albumsPageNumber
      };
    }
    case 'mini-mode-playlist': {
      return {
        ...state,
        miniModePlaylist: action.miniModePlaylist,
        library: action.library
      };
    }
    case 'exit-mini-to-full': {
      return {
        ...state,
        miniModePlaylist: action.miniModePlaylist,
        minimalmode: action.minimalmode
      };
    }
    case 'enter-mini-from-fullplaylist': {
      return {
        ...state,
        miniModePlaylist: action.miniModePlaylist,
        minimalmode: action.minimalmode
      };
    }
    case 'library-reload': {
      return {
        ...state,
        libraryReload: action.libraryReload
      };
    }
    case 'set-maximize': {
      return {
        ...state,
        maximized: action.maximized
      };
    }
    case 'load-playlist': {
      return {
        ...state,
        playlistTracks: action.playlistTracks
      };
    }

    case 'play-album': {
      return {
        ...state,
        playlistTracks: [
          ...state.playlistTracks,
          ...action.playlistTracks.filter(
            (p) => !state.playlistTracks.find((d) => d.afid === p.afid)
          )
        ]
      };
    }

    case 'update-cover': {
      /*  return state.covers.map((cover) => {
        if (cover.fullpath === action.id) {
          return { ...cover, img: action.img };
        } else {
          return cover;
        }
      }); */
      return {
        ...state,
        covers: action.covers
      };
    }

    case 'track-to-playlist': {
      return {
        ...state,
        /*  tracks: action.tracks */
        playlistTracks: [
          ...state.playlistTracks,
          ...action.playlistTracks.filter(
            (p) => !state.playlistTracks.find((d) => d.afid === p.afid)
          )
        ]
      };
    }

    case 'set-covers': {
      const key = 'fullpath';
      return {
        ...state,
        covers: [...state.covers, ...action.covers]
      };
    }

    case 'set-covers-pagenumber': {
      return {
        ...state,
        coversPageNumber: action.coversPageNumber
      };
    }

    case 'reset-albums-covers': {
      return {
        ...state,
        covers: action.covers,
        coversPageNumber: action.coversPageNumber
      };
    }

    case 'set-list-type': {
      return {
        ...state,
        listType: action.listType
      };
    }
    case 'playlist-clear': {
      return {
        ...state,
        playlistTracks: action.playlistTracks
      };
    }
    case 'mini-mode-info': {
      return {
        ...state,
        minimalmodeInfo: action.minimalmodeInfo
      };
    }
    case 'tracks-shuffle': {
      return {
        ...state,
        tracksShuffle: action.tracksShuffle
      };
    }

    case 'playlist-shuffle': {
      return {
        ...state,
        playlistShuffle: action.playlistShuffle
      };
    }

    case 'shuffled-tracks': {
      return {
        ...state,
        shuffledTracks: action.shuffledTracks
      };
    }
    case 'seeking': {
      return { ...state, seeking: action.seeking };
    }
    case 'albums-in-playlist': {
      return {
        ...state,
        albumsInPlaylist: action.albumsInPlaylist
      };
    }

    case 'covers-search-term': {
      return {
        ...state,
        coversSearchTerm: action.coversSearchTerm,
        covers: action.covers,
        coversPageNumber: action.coversPageNumber
      };
    }
    case 'flash-div': {
      return {
        ...state,
        flashDiv: action.flashDiv
      };
    }
    case 'reset-flash-div':
      return { ...state, flashDiv: null };

    case 'loaded-albums':
      return {
        ...state,
        loadedAlbums: action.loadedAlbums
      };

    case 'remove-from-loaded-albums':
      return {
        ...state,
        loadedAlbums: action.removeAlbum
      };

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

// A custom hook to use the audio player context
export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};

// Provider component that encapsulates the state logic
export const AudioPlayerProvider = ({ children }) => {
  const audioRef = useRef(new Audio());
  const audioContextRef = useRef(new (window.AudioContext || window.webkitAudioContext)());
  const trackRef = useRef(null);

  const initialState = {
    audioRef,
    audioContextRef,
    trackRef,
    home: true,
    update: false,
    player: false,
    library: false,

    minimalmode: false,
    minimalmodeInfo: false,
    miniModePlaylist: false,
    maximized: false,
    active: '',
    newtrack: '',
    playNext: false,
    playPrev: false,
    nextTrack: null,
    prevTrack: '',
    artist: '',
    title: '',
    album: '',
    cover: '',
    duration: '',
    currentTime: '',
    pause: false,
    progbarInc: 0,
    volume: 1,
    /* filesPageNumber: 0, */
    albums: [],
    albumsPageNumber: 0,
    tracks: [],
    tracksPageNumber: 0,
    shuffledTracksPageNumber: 0,
    covers: [],
    coversPageNumber: 0,
    coversSearchTerm: '',
    playlistTracks: [],
    shuffledTracks: [],
    playlistInOrder: [],
    albumsInPlaylist: [],
    loadedAlbums: [],
    listType: 'files',
    selectedTrackListType: 'file',
    searchTermFiles: '',
    searchTermAlbums: '',
    randomize: false,
    albumPath: '',
    showMore: null,
    delay: false,
    isLiked: false,
    shuffle: false,
    tracksShuffle: false,
    playlistShuffle: false,
    playlistMode: false,
    /* playlistLength: 0, */
    seeking: false,
    flashDiv: ''
  };

  const [state, dispatch] = useReducer(audioPlayerReducer, initialState);

  return (
    <AudioPlayerContext.Provider value={{ state, dispatch }}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

/* import React from 'react';
import ReactDOM from 'react-dom';
import { AudioPlayerProvider } from './AudioPlayerContext'; // Import the provider
import App from './App';

ReactDOM.render(
  <AudioPlayerProvider>
    <App />
  </AudioPlayerProvider>,
  document.getElementById('root')
);
 */
