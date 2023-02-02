const AppState = () => {
  const audioPlayer = {
    audioRef: useRef(new Audio()),
    /* PAGES */
    home: true,
    update: false,
    player: false,
    library: false,

    /* PLAYER RELATED */
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
    active: '',
    newtrack: '',
    isLiked: false,

    /* LAYOUT RELATED */
    minimalmode: false,
    miniModePlaylist: false,
    maximized: false,

    /* DB STATE */
    albums: [],
    tracks: [],

    /* SEARCH AND OTHER ALL LIBRARY OPTIONS */

    type: 'files',
    searchTermFiles: '',
    searchTermAlbums: '',
    /* randomize: false, */
    /* albumPath: '', */
    /* showMore: null, */
    delay: false,

    /* INFINITE LIST STATE */
    albumsPageNumber: 0,
    tracksPageNumber: 0,
    playlistMode: false
  };
};
