import { useState, useEffect, useMemo } from 'react';
/* import axios from "axios"; */

/* const client = axios.create({
  baseURL: "http://localhost:3008/",
  proxy: false,

}); */

const useTracks = (tracksPageNumber, tracksSearchTerm, sortType, resetKey, dispatch) => {
  const [tracksLoading, setTracksLoading] = useState(true);
  const [tracksError, setTracksError] = useState(false);
  /*  const [tracks, setTracks] = useState([]); */
  /*   const [albums, setAlbums] = useState([]); */
  const [hasMoreTracks, setHasMoreTracks] = useState(false);

  useEffect(() => {
    let isSubscribed = true;
    const loadTracks = async () => {
      let success = true;
      setTracksLoading(true);
      setTracksError(false);
      let trackRequest = await window.api.getTracks(tracksPageNumber, tracksSearchTerm);
      if (trackRequest && isSubscribed) {
        dispatch({
          type: 'tracks-playlist',
          tracks: trackRequest
        });
        setHasMoreTracks(trackRequest.length > 0);
        setTracksLoading(false);
      }
      return () => console.log('files found');
    };

    loadTracks();
    return () => (isSubscribed = false);
  }, [tracksPageNumber, tracksSearchTerm, sortType, resetKey]);

  return { tracksLoading, /* tracks, setTracks, */ hasMoreTracks, tracksError };
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
    if (id) {
      loadAlbum();
      return () => (subscribed = false);
    }
  }, [id]);
  return;
};

const useTotalTracksStat = () => {
  console.log('hit');
  const [totalTracks, setTotalTracks] = useState();
  const [error, setError] = useState([]);

  useEffect(() => {
    let subscribed = true;
    const getTotalTracks = async () => {
      const totalTracksRequest = await window.api.totalTracksStat();
      if (totalTracksRequest && subscribed) {
        console.log(totalTracksRequest);
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
  console.log('hit top 10');
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
  return { last10Albums };
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

const usePlaylistDialog = (req, playlistTracks = null) => {
  let isSubscribed = true;
  useEffect(() => {
    const openplaylist = async () => {
      console.log('opening');
      const openpl = await window.api.openPlaylist();
      if (openpl && isSubscribed) {
        console.log(openpl);
      }
    };
    if (req === 'playlist-open') openplaylist();
    return () => (isSubscribed = false);
  }, [req, playlistTracks]);

  /*   if (req === 'playlist-open') {
    const open = await window.api.openPlaylist();
    console.log('open: ', open);
  } */
  /*  if (req === 'playlist-save') {
    const save = await window.api.savePlaylist(playlistTracks);
  } */
};

export {
  useTracks,
  useAlbums,
  useAlbumTracks,
  useTotalTracksStat,
  useTopTenArtistsStat,
  useLast10AlbumsStat,
  useLast100TracksStat,
  usePlaylist,
  usePlaylistDialog
};
