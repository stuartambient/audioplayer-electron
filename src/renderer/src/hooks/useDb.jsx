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
        console.log('album-request-length: ', albumRequest.length);
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

export { useTracks, useAlbums, useAlbumTracks };
