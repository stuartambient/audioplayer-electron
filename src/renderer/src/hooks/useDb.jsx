/* import { is } from '@electron-toolkit/utils'; */
import { useState, useEffect, useMemo } from 'react';

/* import axios from "axios"; */

/* const client = axios.create({
  baseURL: "http://localhost:3008/",
  proxy: false,
}); */

const useTracks = (
  tracksPageNumber,
  tracksSearchTerm,
  sortType,
  resetKey,
  state,
  dispatch,
  shuffle
) => {
  const [tracksLoading, setTracksLoading] = useState(true);
  const [tracksError, setTracksError] = useState(false);
  const [hasMoreTracks, setHasMoreTracks] = useState(false);
  useEffect(() => {
    let isSubscribed = true;
    const loadTracks = async () => {
      console.log('load tracks');
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
      console.log('shuffled tracks');
      setTracksLoading(true);
      setTracksError(false);
      /////////////////

      let start, end;
      if (tracksPageNumber === 0) {
        const totaltracks = await window.api.totalTracksStat();
        const setRandArray = await window.api.setShuffledTracksArray(totaltracks);
        start = 0;
        end = 50;
      } else {
        start = state.tracks.length + 1;
        end = start + 49;
      }
      const shuffledTracks = await window.api.getShuffledTracks(start, end);
      console.log(shuffledTracks, isSubscribed);
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

    shuffle ? loadShuffledTracks() : loadTracks();
    return () => (isSubscribed = false);
  }, [tracksPageNumber, tracksSearchTerm, sortType, resetKey, shuffle]);
  return {
    tracksLoading,
    hasMoreTracks,
    tracksError,
    shuffle,
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
      setAlbumsLoading(true);
      setAlbumsError(false);
      const albumRequest = await window.api.getAlbums(albumsPageNumber, albumsSearchTerm);
      if (albumRequest && isSubscribed) {
        /* console.log('album-request-length: ', albumRequest.length); */
        dispatch({
          type: 'albums-playlist',
          albums: albumRequest
        });
        setHasMoreAlbums(albumRequest.length > 0);
        setAlbumsLoading(false);
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

const useTotalTracksStat = () => {
  const [totalTracks, setTotalTracks] = useState();
  const [error, setError] = useState([]);

  useEffect(() => {
    let subscribed = true;
    const getTotalTracks = async () => {
      const totalTracksRequest = await window.api.totalTracksStat();
      if (totalTracksRequest && subscribed) {
        setTotalTracks(totalTracksRequest);
      } else {
        return;
      }
    };

    getTotalTracks();
    return () => (subscribed = false);
  }, []);
  return { totalTracks };
};

const useTopTenArtistsStat = () => {
  const [topTenArtists, setTopTenArtists] = useState([]);
  useEffect(() => {
    let subscribed = true;
    const getTopTenArtists = async () => {
      const topTenArtistsRequest = await window.api.topTenArtistsStat();
      if (topTenArtistsRequest && subscribed) {
        setTopTenArtists(topTenArtistsRequest);
      } else {
        return;
      }
    };
    getTopTenArtists();
    return () => (subscribed = false);
  }, []);
  return { topTenArtists };
};

const useAllAlbumsCovers = (coversPageNumber, dispatch, coversSearchTerm = null) => {
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
        setHasMoreCovers(coversRequest.length > 0);
        setCoversLoading(false);
      }
    };

    if (!coversPageNumber) return;
    loadCovers();
    return () => (isSubscribed = false);
  }, [coversPageNumber]);

  return { coversLoading, /* covers, setCovers, */ hasMoreCovers, coversError };
};

const useLast10AlbumsStat = () => {
  const [last10Albums, setLast10Albums] = useState([]);
  useEffect(() => {
    let subscribed = true;
    const getLast10Albums = async () => {
      const last10AlbumsRequest = await window.api.last10AlbumsStat();
      if (last10AlbumsRequest && subscribed) {
        /* console.log(last10AlbumsRequest); */
        setLast10Albums(last10AlbumsRequest);
      } else {
        return;
      }
    };
    getLast10Albums();
    return () => (subscribed = false);
  }, []);
  return { last10Albums, setLast10Albums };
};

const useLast100TracksStat = () => {
  const [last100Tracks, setLast100Tracks] = useState([]);
  useEffect(() => {
    let subscribed = true;
    const getLast100Tracks = async () => {
      const last100TracksRequest = await window.api.last100TracksStat();
      if (last100TracksRequest && subscribed) {
        /* console.log(last100TracksRequest); */
        setLast100Tracks(last100TracksRequest);
      } else {
        return;
      }
    };
    getLast100Tracks();
    return () => (subscribed = false);
  }, []);
  return { last100Tracks };
};

const usePlaylistDialog = (req, playlistTracks, dispatch) => {
  useEffect(() => {
    let isSubscribed = true;
    const openplaylist = async () => {
      try {
        const openpl = await window.api.openPlaylist();
        if (openpl && isSubscribed) {
          dispatch({
            type: 'load-playlist',
            playlistTracks: openpl
          });
        }
      } catch (e) {
        console.log(e.message);
      }
    };

    const saveplaylist = async () => {
      try {
        const savepl = await window.api.savePlaylist(playlistTracks);
        if (savepl && isSubscribed) {
          console.log(savepl);
        }
      } catch (e) {
        console.log(e.message);
      }
    };
    if (req === 'playlist-open') {
      openplaylist();
      /* setPlaylistReq(''); */
      return () => (isSubscribed = false);
    }
    if (req === 'playlist-save') {
      saveplaylist();
      /* setPlaylistReq(''); */
      return () => (isSubscribed = false);
    }
  }, [req]);
};

const useGetPlaylists = () => {
  const [myPlaylists, setMyPlaylists] = useState(['no playlists']);

  useEffect(() => {
    let subscribed = true;
    const getmyplaylists = async () => {
      const myplaylists = await window.api.getPlaylists();
      if (myplaylists) {
        setMyPlaylists(myplaylists);
      }
    };
    getmyplaylists();
    return () => (subscribed = false);
  }, []);
  return { myPlaylists };
};

/* const useRandomTracks = (shuffledTracksPageNumber, state, dispatch, shuffle) => {
  const [shuffledLoading, setShuffledLoading] = useState(true);
  const [shuffledError, setShuffledError] = useState(false);
  const [hasMoreShuffled, setHasMoreShuffled] = useState(false);
  useEffect(() => {
    let isSubscribed = true;
    const shuffleTracks = async () => {
      let start, end;
      if (!state.shuffleTracks) {
        start = 0;
        end = 49;
      } else {
        start = state.shuffledTracks.length - 1;
        const end = start + 49;
      }
      const test = await window.api.testGlobal(start, end);
      if (test && isSubscribed) {
        console.log('test: ', test);
        dispatch({
          type: 'shuffled-tracks',
          shuffledTracks: [...state.shuffledTracks, ...test]
        });
        setHasMoreShuffled(test.length > 0);
        setShuffledLoading(false);
      }
    };
    if (shuffledTracksPageNumber) shuffleTracks();
    return () => (isSubscribed = false);
  }, [shuffledTracksPageNumber]);
  return { shuffledLoading, hasMoreShuffled, shuffledError }; */
//};

export {
  useTracks,
  useAlbums,
  useAlbumTracks,
  useTotalTracksStat,
  useTopTenArtistsStat,
  useLast10AlbumsStat,
  useLast100TracksStat,
  usePlaylist,
  usePlaylistDialog,
  useGetPlaylists,
  useAllAlbumsCovers
  /* useRandomTracks */
};
