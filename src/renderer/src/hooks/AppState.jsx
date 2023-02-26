import { useReducer, useRef } from 'react';

const AppState = () => {
  const audioPlayer = {
    audioRef: useRef(new Audio()),
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
    /* currentVolume: 1.0, */
    /* filesPageNumber: 0, */
    albums: [],
    albumsPageNumber: 0,
    tracks: [],
    tracksPageNumber: 0,
    covers: [],
    coversPageNumber: undefined,
    playlistTracks: [],
    shuffledTracks: [],
    shuffledTracksPageNumber: 0,

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
    playlistMode: false,
    seeking: false
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

      case 'current-playlist': {
        return {
          ...state,
          /*  tracks: action.tracks */
          playlistTracks: [...state.playlistTracks, ...action.playlistTracks]
        };
      }
      case 'track-to-playlist': {
        return {
          ...state,
          /*  tracks: action.tracks */
          playlistTracks: action.playlistTracks
        };
      }
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
          playlistTracks: [...state.playlistTracks, ...action.playlistTracks]
        };
      }

      case 'set-covers': {
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
      case 'mini-mode-info': {
        return {
          ...state,
          minimalmodeInfo: action.minimalmodeInfo
        };
      }
      case 'shuffle': {
        return {
          ...state,
          shuffle: action.shuffle
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

      default:
        return;
    }
  };

  const [state, dispatch] = useReducer(reducer, audioPlayer);
  return { state, dispatch };
};

export default AppState;
