/* import { is } from '@electron-toolkit/utils'; */
import { useState, useEffect, useMemo, useRef } from 'react';
import { useAudioPlayer } from '../AudioPlayerContext';

const useTracks = (
  tracksPageNumber,
  tracksSearchTerm,
  sortType,
  resetKey,
  state,
  dispatch,
  tracksShuffle
) => {
  const [tracksLoading, setTracksLoading] = useState(true);
  const [tracksError, setTracksError] = useState(false);
  const [hasMoreTracks, setHasMoreTracks] = useState(false);
  useEffect(() => {
    let isSubscribed = true;

    const loadTracks = async () => {
      setTracksLoading(true);
      setTracksError(false);

      let trackRequest = await window.api.getTracks(tracksPageNumber, tracksSearchTerm, sortType);

      if (trackRequest && isSubscribed) {
        if (tracksPageNumber === 0) {
          setTimeout(() => {
            dispatch({
              type: 'add-shuffled-tracks',
              tracks: trackRequest
            });

            setTracksLoading(false);
            setHasMoreTracks(trackRequest.length === 200);
          }, 500);
        }
        if (tracksPageNumber > 0) {
          setTimeout(() => {
            dispatch({
              type: 'tracks-playlist',
              tracks: trackRequest
            });

            setTracksLoading(false);
            setHasMoreTracks(trackRequest.length === 200);
          }, 500);
        }
      }
    };

    const loadShuffledTracks = async () => {
      setTracksLoading(true);
      setTracksError(false);
      /////////////////

      let start, end;
      if (tracksPageNumber === 0) {
        const setRandArray = await window.api.setShuffledTracksArray();
      }
      const shuffledTracks = await window.api.getShuffledTracks(tracksPageNumber);
      if (shuffledTracks && isSubscribed) {
        if (tracksPageNumber === 0) {
          setTimeout(() => {
            dispatch({
              type: 'add-shuffled-tracks',
              tracks: shuffledTracks
            });
            setHasMoreTracks(shuffledTracks.length === 200);
            setTracksLoading(false);
          }, 500);
        }

        if (tracksPageNumber > 0) {
          setTimeout(() => {
            dispatch({
              type: 'tracks-playlist',
              tracks: shuffledTracks
            });
            setHasMoreTracks(shuffledTracks.length === 200);
            setTracksLoading(false);
          }, 500);
        }
      }
    };

    tracksShuffle && state.listType === 'files' ? loadShuffledTracks() : loadTracks();
    return () => (isSubscribed = false);
  }, [tracksPageNumber, tracksSearchTerm, sortType, resetKey, tracksShuffle]);
  return {
    tracksLoading,
    hasMoreTracks,
    tracksError,
    tracksShuffle,
    resetKey
  };
};

const useAlbums = (albumsPageNumber, albumsSearchTerm, sortType, resetKey, dispatch) => {
  const [albumsLoading, setAlbumsLoading] = useState(true);
  const [albumsError, setAlbumsError] = useState(false);
  const [hasMoreAlbums, setHasMoreAlbums] = useState(false);

  useEffect(() => {
    let isSubscribed = true;

    const loadAlbums = async () => {
      try {
        setAlbumsLoading(true);
        setAlbumsError(false);
        const albumRequest = await window.api.getAlbums(
          albumsPageNumber,
          albumsSearchTerm,
          sortType
        );

        if (albumRequest && isSubscribed) {
          setTimeout(() => {
            dispatch({
              type: 'albums-playlist',
              albums: albumRequest
            });
            setHasMoreAlbums(albumRequest.length === 200);
            setAlbumsLoading(false);
          }, 500);
        }
      } catch (error) {
        if (isSubscribed) {
          setAlbumsError(true);
        }
      }
    };

    loadAlbums();
    return () => (isSubscribed = false);
  }, [albumsPageNumber, albumsSearchTerm, sortType, resetKey]);

  return { albumsLoading, hasMoreAlbums, albumsError };
};

const useAlbumTracks = (pattern) => {
  const [albumTracks, setAlbumTracks] = useState([]);
  const [error, setError] = useState([]);

  useEffect(() => {
    let subscribed = true;
    const loadAlbumTracks = async () => {
      const albumTracksRequest = await window.api.getAlbumTracks(pattern);
      if (albumTracksRequest && subscribed) {
        setAlbumTracks(albumTracksRequest);
      } else {
        return;
      }
    };
    if (pattern) {
      loadAlbumTracks();
      return () => (subscribed = false);
    }
  }, [pattern]);
  return { albumTracks, setAlbumTracks };
};

const usePlaylist = (id, dispatch) => {
  /* const [playlistTracks, setPlaylistTracks] = useState([]); */
  const [error, setError] = useState([]);

  useEffect(() => {
    let subscribed = true;
    const loadAlbum = async () => {
      const playlistTracksRequest = await window.api.getAlbum(id);
      if (playlistTracksRequest && subscribed) {
        /* setPlaylistTracks([...playlistTracks, ...tracksRequest]); */
        dispatch({
          type: 'current-playlist',
          playlistTracks: playlistTracksRequest
        });
      } else {
        return;
      }
    };
    if (!id) return;

    loadAlbum();
    return () => (subscribed = false);
  }, [id]);
  return;
};

const useTopHundredArtistsStat = () => {
  const [topHundredArtists, setTopHundredArtists] = useState([]);
  useEffect(() => {
    let subscribed = true;
    const getTopHundredArtists = async () => {
      const topHundredArtistsRequest = await window.api.topHundredArtistsStat();
      if (topHundredArtistsRequest && subscribed) {
        setTopHundredArtists(topHundredArtistsRequest);
      } else {
        return;
      }
    };
    getTopHundredArtists();
    return () => (subscribed = false);
  }, []);
  return { topHundredArtists };
};

const useGenres = (setGenres) => {
  /* const [genres, setGenres] = useState([]); */
  useEffect(() => {
    let subscribed = true;
    const getGenres = async () => {
      const genresRequest = await window.api.genresStat();
      if (genresRequest && subscribed) {
        setGenres(genresRequest);
      } else {
        return 'no results';
      }
    };
    getGenres();
    return () => (subscribed = false);
  }, []);
  /* return genres; */
};

const useAllAlbumsCovers = (
  coversPageNumber,
  coversSearchTerm,
  coversDateSort,
  coversMissingReq,
  dispatch,
  resetKey,
  coverslength
) => {
  const [coversLoading, setCoversLoading] = useState(true);
  const [coversError, setCoversError] = useState(false);
  const [hasMoreCovers, setHasMoreCovers] = useState(false);

  useEffect(() => {
    let isSubscribed = true;

    const loadCovers = async () => {
      try {
        setCoversLoading(true);
        setCoversError(false);

        const coversRequest = await window.api.getCovers(
          coversPageNumber,
          coversSearchTerm,
          coversDateSort,
          coversMissingReq
        );

        if (coversRequest && isSubscribed) {
          setTimeout(() => {
            dispatch({
              type: 'set-covers',
              covers: coversRequest
            });

            setHasMoreCovers(coversRequest.length >= 100);
            setCoversLoading(false);
          }, 250); // Adjust the delay time (500ms) as needed
        }
      } catch (error) {
        if (isSubscribed) {
          setCoversError(true);
          setCoversLoading(false);
        }
      }
    };

    // Condition to decide when to load covers
    if ((coversPageNumber === 0 && coverslength === 0) || coversPageNumber * 100 === coverslength) {
      loadCovers();
    }

    return () => {
      isSubscribed = false;
    };
  }, [
    coversPageNumber,
    coversSearchTerm,
    coversDateSort,
    coversMissingReq,
    dispatch,
    resetKey,
    coverslength
  ]);

  return { coversLoading, hasMoreCovers, coversError };
};

const usePlaylistDialog = (req, playlistTracks, dispatch, setPlaylistReq) => {
  useEffect(() => {
    let isSubscribed = true;

    const openplaylist = async () => {
      try {
        const openpl = await window.api.openPlaylist();
        if (isSubscribed) {
          if (openpl === 'action cancelled') {
            setPlaylistReq('');
          } else {
            dispatch({
              type: 'load-playlist',
              playlistTracks: openpl
            });
            setPlaylistReq('');
          }
        }
      } catch (e) {
        console.log(e.message);
      }
    };

    const saveplaylist = async () => {
      try {
        const savepl = await window.api.savePlaylist(playlistTracks);
        if (isSubscribed) {
          if (savepl === 'action cancelled') {
            setPlaylistReq('');
          } else {
            console.log(savepl);
            setPlaylistReq(''); // Clear request after handling
          }
        }
      } catch (e) {
        console.log(e.message);
      }
    };

    if (req === 'playlist-open') {
      openplaylist();
    } else if (req === 'playlist-save') {
      saveplaylist();
    }

    return () => {
      isSubscribed = false; // Cleanup when component unmounts
    };
  }, [req, playlistTracks, dispatch, setPlaylistReq]);
};

const useGetPlaylists = (setMyPlaylists) => {
  useEffect(() => {
    let subscribed = true;
    const getmyplaylists = async () => {
      const myplaylists = await window.api.getPlaylists();
      if (myplaylists) {
        setMyPlaylists(myplaylists);
      }
    };
    if (subscribed) {
      getmyplaylists();
    }
    return () => (subscribed = false);
  }, []);
};

const useDistinctDirectories = (setDirectories) => {
  useEffect(() => {
    let subscribed = true;
    const getDistinctDirectories = async () => {
      const myDirectories = await window.api.distinctDirectories();
      if (myDirectories) {
        setDirectories(myDirectories);
      }
    };
    if (subscribed) {
      getDistinctDirectories();
    }
    return () => (subscribed = false);
  }, []);
};

const useTotalTracksStat = (setTotalTracks) => {
  const [error, setError] = useState([]);

  useEffect(() => {
    let isSubscribed = true;
    const getTotalTracks = async () => {
      try {
        const totalTracksRequest = await window.api.totalTracksStat();
        if (totalTracksRequest && isSubscribed) {
          setTotalTracks(totalTracksRequest);
        }
      } catch (e) {
        if (isSubscribed) {
          setError((prevErrors) => [...prevErrors, e.message]);
        }
      }
    };
    getTotalTracks();
    return () => {
      isSubscribed = false;
    };
  }, [setTotalTracks]);

  /*  return error; */
};

const useTracksByRoot = (root, setTracks) => {
  useEffect(() => {
    let isSubscribed = true;
    const getTracksByRoot = async () => {
      const results = await window.api.getTracksByRoot(root);
      if (results && isSubscribed) {
        // Instead of setting the state here, call the callback with the results
        setTracks(results);
      }
    };

    getTracksByRoot();
    return () => {
      isSubscribed = false;
    };
  }, [root, setTracks]); // Include onTracksFetched in the dependencies array
};

export {
  useTracks,
  useAlbums,
  useAlbumTracks,
  useTopHundredArtistsStat,
  useGenres,
  usePlaylist,
  usePlaylistDialog,
  useGetPlaylists,
  useAllAlbumsCovers,
  useDistinctDirectories,
  useTotalTracksStat,
  useTracksByRoot
};
