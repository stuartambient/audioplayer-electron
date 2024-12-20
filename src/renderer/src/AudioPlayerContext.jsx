import React, { createContext, useReducer, useContext, useRef } from 'react';
/* this should appear in refactor/useContext only */
// Context creation
const AudioPlayerContext = createContext();

// Reducer function to manage state updates
const audioPlayerReducer = (state, action) => {
  /* console.log('action: ', action); */
  switch (action.type) {
    case 'library': {
      return { ...state, library: !state.library };
    }
    case 'pauseplay': {
      return { ...state, pause: !state.pause };
    }

    case 'pause-on-empty': {
      return { ...state, pause: false };
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
        activeList: action.activeList
        /* selectedTrackListType: action.selectedTrackListType */
      };
    }

    case 'reset': {
      return {
        ...state,
        newtrack: '',
        activeList: '',
        active: '',
        playNext: false,
        playPrev: false,
        nextTrack: '',
        prevTrack: '',
        artist: '',
        title: '',
        album: '',
        cover:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyQAAAHGCAIAAAAKe9jzAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAQ9SURBVHhe7cGBAAAAAMOg+VMf4QJVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABw1AC4PgABfvY6uQAAAABJRU5ErkJggg==',
        duration: '',
        pause: action.pause
      };
    }
    case 'duration': {
      return {
        ...state,
        duration: action.duration
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
        library: action.library,
        tagEditor: action.tagEditor
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
        player: action.player,
        tagEditor: action.tagEditor
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

    case 'current-playlist': {
      return {
        ...state,
        /*  tracks: action.tracks */
        playlistTracks: [...state.playlistTracks, ...action.playlistTracks]
      };
    }

    case 'albums-playlist': {
      return {
        ...state,
        albums: [...state.albums, ...action.albums]
      };
    }
    case 'reset-tracks': {
      return {
        ...state,
        tracks: action.tracks
      };
    }

    case 'reset-queue': {
      return {
        ...state,
        newtrack: '',
        nextTrack: '',
        prevTrack: '',
        active: ''
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
            (p) => !state.playlistTracks.find((d) => d.track_id === p.track_id)
          )
        ]
      };
    }

    case 'play-this-album': {
      return {
        ...state,
        playlistTracks: action.playlistTracks,
        listType: 'playlist',
        newtrack: 0,
        activeList: action.list
      };
    }

    case 'start-album': {
      return {
        ...state,
        pause: false
      };
    }

    case 'stop-this-album': {
      return {
        ...state,
        playlistTracks: [],
        pause: true
      };
    }

    case 'pause-on-change': {
      return {
        ...state,
        pause: action.pause
      };
    }

    case 'track-to-playlist': {
      return {
        ...state,
        playlistTracks: [
          ...state.playlistTracks,
          ...action.playlistTracks.filter(
            (p) => !state.playlistTracks.find((d) => d.track_id === p.track_id)
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

    case 'remove-track': {
      return {
        ...state,
        playlistTracks: state.playlistTracks.filter((track) => track.track_id !== action.id)
      };
    }

    case 'mini-mode-info': {
      return {
        ...state,
        minimalmodeInfo: action.minimalmodeInfo
      };
    }

    case 'shuffle-reset': {
      return {
        ...state,
        newtrack: action.newtrack
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

    case 'seeking': {
      return { ...state, seeking: action.seeking };
    }
    case 'covers-date-sort': {
      return {
        ...state,
        coversDateSort: action.coversDateSort,
        covers: action.covers,
        coversPageNumber: action.coversPageNumber
      };
    }

    case 'covers-refresh': {
      return {
        ...state,
        coversMissingReq: action.coversMissingReq,
        covers: action.covers,
        coversPageNumber: action.coversPageNumber,
        coversSearchTerm: action.coversSearchTerm,
        coversDateSort: action.coversDateSort
      };
    }

    case 'covers-missing-request': {
      return {
        ...state,
        covers: action.covers,
        coversPageNumber: action.coversPageNumber,
        coversMissingReq: action.coversMissingReq
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

    case 'list-scroll-option':
      return {
        ...state,
        listScroll: !state.listScroll
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
    tagEditor: false,

    minimalmode: false,
    minimalmodeInfo: false,
    miniModePlaylist: false,
    /*  maximized: false, */
    active: '',
    newtrack: '',
    activeList: '',
    playNext: false,
    playPrev: false,
    nextTrack: '',
    prevTrack: '',
    artist: '',
    title: '',
    album: '',
    cover: '',
    duration: '',
    pause: true,
    volume: 1,
    albums: [],
    albumsPageNumber: 0,
    tracks: [],
    tracksPageNumber: 0,
    shuffledTracksPageNumber: 0,
    covers: [],
    coversPageNumber: 0,
    coversSearchTerm: '',
    coversDateSort: 'DESC',
    coversMissingReq: 'not-requested',
    playlistTracks: [],
    shuffledTracks: [],
    playlistInOrder: [],
    listType: 'files',
    listScroll: true,
    /*     selectedTrackListType: 'file', */
    searchTermFiles: '',
    searchTermAlbums: '',
    randomize: false,
    showMore: null,
    delay: false,
    isLiked: false,
    shuffle: false,
    tracksShuffle: false,
    playlistShuffle: false,
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
