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
          dispatch({
            type: 'add-shuffled-tracks',
            tracks: trackRequest
          });
        }
        if (tracksPageNumber > 0) {
          dispatch({
            type: 'tracks-playlist',
            tracks: trackRequest
          });
        }
        setHasMoreTracks(trackRequest.length > 0);
        setTracksLoading(false);
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
          dispatch({
            type: 'add-shuffled-tracks',
            tracks: shuffledTracks
          });
        }
        if (tracksPageNumber > 0) {
          dispatch({
            type: 'tracks-playlist',
            tracks: shuffledTracks
          });
        }
        setHasMoreTracks(shuffledTracks.length > 0);
        setTracksLoading(false);
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
        /* setAlbumsError(false); */
        const albumRequest = await window.api.getAlbums(
          albumsPageNumber,
          albumsSearchTerm,
          sortType
        );

        if (albumRequest && isSubscribed) {
          /* console.log('album-request-length: ', albumRequest.length); */
          dispatch({
            type: 'albums-playlist',
            albums: albumRequest
          });
          setHasMoreAlbums(albumRequest.length > 0);
          /*         setAlbumsLoading(false); */
        }
      } catch (error) {
        if (isSubscribed) {
          setAlbumsError(true);
        }
      } finally {
        if (isSubscribed) {
          setAlbumsLoading(false);
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
      setCoversLoading(true);
      setCoversError(false);
      let coversRequest = await window.api.getCovers(coversPageNumber, coversSearchTerm);
      if (coversRequest && isSubscribed) {
        /* setCovers([...covers, ...coversRequest]); */
        dispatch({
          type: 'set-covers',
          covers: coversRequest
        });
        if (coversRequest.length < 50) {
          setHasMoreCovers(false);
        } else {
          setHasMoreCovers(true);
        }
        /* setHasMoreCovers(coversRequest.length > 0); */
        setCoversLoading(false);
      }
    };

    /* if (!coversPageNumber) return; */
    /* console.log('-----> ', coversPageNumber, coverslength); */
    if (
      (isSubscribed && coversPageNumber === 0 && coverslength === 0) ||
      (isSubscribed && coversPageNumber * 50 === coverslength)
    ) {
      loadCovers();
    } /* else if (isSubscribed && (coversPageNumber + 1) * 50 === coverslength) {
      dispatch({
        type: 'set-covers-pagenumber',
        coversPageNumber: coversPageNumber + 1
      });
      loadCovers();
    } */
    return () => (isSubscribed = false);
  }, [coversPageNumber, coversSearchTerm, resetKey, coverslength]);

  return { coversLoading, hasMoreCovers, coversError };
};

const usePlaylistDialog = (req, playlistTracks, dispatch, setPlaylistReq) => {
  useEffect(() => {
    let isSubscribed = true;
    const openplaylist = async () => {
      try {
        const openpl = await window.api.openPlaylist();
        if (openpl && isSubscribed) {
          if (openpl === 'action cancelled') {
            return setPlaylistReq('');
          } else {
            dispatch({
              type: 'load-playlist',
              playlistTracks: openpl
            });
          }
        }
      } catch (e) {
        console.log(e.message);
      }
    };

    const saveplaylist = async () => {
      try {
        const savepl = await window.api.savePlaylist(playlistTracks);
        if (savepl && isSubscribed) {
          if (savepl === 'action cancelled') {
            setPlaylistReq('');
          } else {
            console.log(savepl);
          }
          /* setPlaylistReq(''); */
        }
      } catch (e) {
        console.log(e.message);
      }
    };
    if (req === 'playlist-open') {
      openplaylist();
      /* setPlaylistReq(''); */
      return () => {
        isSubscribed = false;
        /* setPlaylistReq(''); */
      };
    }
    if (req === 'playlist-save') {
      saveplaylist();
      /* setPlaylistReq(''); */
      return () => {
        isSubscribed = false;
        /* setPlaylistReq(''); */
      };
    }
  }, [req]);
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
